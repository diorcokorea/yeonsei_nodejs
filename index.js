let express = require("express");
let session = require("express-session");
let bodyParser = require("body-parser");
let favicon = require("serve-favicon");
let ejs = require("ejs");
let pdf = require("html-pdf");
let net = require("net");
let fs = require("fs");
let app = express();
const cors = require("cors");
const path = require("path");
app.use("/image", express.static(path.join(__dirname, "/image")));
app.use("/media", express.static(path.join(__dirname, "/media")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  session({
    secret: "mySecretKey!@#$",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(cors());
app.use(favicon(path.join(__dirname, "/image", "favicon.ico")));
app.get("/", function (req, res) {
  fs.readFile("___________UI_1920x969.html", function (error, data) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});
require("./routes/fileupload")(app);

function base64_decode(base64str, file) {
  let bitmap = Buffer.from(base64str, "base64");
  fs.writeFileSync(file, bitmap);
}
async function openClientConnection(pathToSocket, sendJson) {
  ///await setTimeoutPromise(3000);
  const client = new net.Socket();
  let accumulatedData = new Buffer.alloc(1024 * 10);
  return new Promise((res, rej) => {
    let receiveJson = Buffer.alloc(0);
    client.connect(pathToSocket, () => {
      client.setTimeout(1000);
      client.setEncoding("utf8");
      console.log("connected to server");
      client.write(sendJson);
    });
    client.on("data", (data) => {
      accumulatedData = data;
    });
    client.on("end", () => {
      if (accumulatedData.length) {
        client.emit("_msg", accumulatedData);
      }
    });
    client.on("_msg", (msg) => {
      res(msg);
    });
    client.on("error", (err) => rej(err));
  });
}
function setTimeoutPromise(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}
app.post("/reading", function (req, res) {
  if (
    req.body.image === undefined ||
    req.body.filepath === undefined ||
    req.body.classification === undefined ||
    req.sessionID === undefined
  ) {
    let response = {};
    response["success"] = false;
    response["reason"] = "parameter exception";
    res.json(response);
    return;
  }
  if (!req.session.num) {
    req.session.num = 1;
  } else {
    req.session.num += 1;
  }
  if (
    !(
      req.body.classification === "stable" ||
      req.body.classification === "unstable"
    )
  ) {
    let response = {};
    response["success"] = false;
    response["reason"] = "parameter exception";
    res.json(response);
    return;
  }
  let now = new Date();
  let year = String(now.getFullYear());
  let month = String(("0" + (now.getMonth() + 1)).slice(-2));
  let day = String(("0" + now.getDate()).slice(-2));

  let baseDir = path.join(
    "/media",
    year,
    month,
    day,
    req.sessionID,
    String(req.session.num)
  );
  let dir = path.join(__dirname, baseDir);
  const mediadir = path.join(__dirname, "/media");
  fs.mkdirSync(dir, { recursive: true });
  console.log(dir, req.body.filepath);
  base64_decode(req.body.image, path.join(dir, req.body.filepath));
  fs.copyFileSync(
    path.join(mediadir, req.body.filepath),
    path.join(dir, req.body.filepath)
  );

  //-->
  // let pathToSocket = {port:8888, host:'localhost'};
  // let sendJson = JSON.stringify({ "filepath" : path.join(dir, req.body.filepath).toString("utf8"), "classification" : req.body.classification});
  // openClientConnection(pathToSocket, sendJson).then(function(result_json) {
  // 	let is_stable = true;
  // 	if(req.body.classification === 'unstable')
  // 		is_stable = false;

  // 	var response = {};
  // 	response['success'] = true;
  // 	response['is_stable'] = is_stable;
  // 	response['result_image'] = null;
  // 	response['result_json'] = result_json;
  // 	response['id'] = baseDir;
  // 	res.setHeader("Content-Type","application/json");
  // 	res.json(response);

  // }).catch(function(err)
  // {
  // 	let response = {};
  // 	response['success'] = false;
  // 	response['reason'] = err.message;
  // 	res.json(response);
  // });
  //<--
  //-->
  let is_stable = true;
  let result_json_filename = "json_stable.txt";

  if (req.body.classification === "unstable") {
    is_stable = false;
    result_json_filename = "json_unstable.txt";
  }

  let arImageFile = req.body.filepath.split(".");
  var arJsonFile = result_json_filename.split(".");

  let result_json = fs.readFileSync(
    path.join(__dirname, "/media", result_json_filename),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(dir, arImageFile[0] + "_" + arJsonFile[0] + ".txt"),
    result_json
  );

  var response = {};
  response["success"] = true;
  response["is_stable"] = is_stable;
  response["result_image"] = null;
  response["result_json"] = result_json;
  response["id"] = baseDir;
  res.setHeader("Content-Type", "application/json");
  res.json(response);
  //<--
});

app.post("/pdfgen", function (req, res) {
  console.log(req.body);
  if (
    req.body.image === undefined ||
    req.body.filepath === undefined ||
    req.body.classification === undefined ||
    req.body.result_json === undefined ||
    req.body.id === undefined ||
    req.sessionID === undefined
  ) {
    let response = {};
    response["success"] = false;
    response["reason"] = "parameter exception";
    res.json(response);
    return;
  }

  let normal = 0,
    abnormal = 0;
  let result_json = JSON.parse(req.body.result_json);
  for (var key in result_json.results) {
    if (result_json.results[key].class === 1) {
      normal++;
    } else if (result_json.results[key].class === 2) {
      abnormal++;
    }
  }

  let arImageFile = req.body.filepath.split(".");
  ejs.renderFile(
    path.join(__dirname, "report-template.ejs"),
    { request: req.body },
    (err, data) => {
      if (err) {
        let response = {};
        response["success"] = false;
        response["reason"] = String(err);
        res.json(response);
        return;
      } else {
        let options = {
          height: "11.25in",
          width: "8.5in",
          header: {
            height: "20mm",
          },
          footer: {
            height: "20mm",
          },
        };
        if (!req.session.num) {
          req.session.num = 1;
        } else {
          req.session.num += 1;
        }
        let baseDir = path.join(req.body.id, arImageFile[0] + ".pdf");

        pdf
          .create(data, options)
          .toFile(path.join(__dirname, baseDir), function (err, data) {
            if (err) {
              let response = {};
              response["success"] = false;
              response["reason"] = String(err);
              res.json(response);
              return;
            }
            let baseDir = String(
              path.join(req.body.id, arImageFile[0] + ".pdf")
            );
            let response = {};
            response["success"] = true;

            baseDir = encodeURI(baseDir.replace(/\\/gi, "/"));
            response["url"] = `${req.protocol}://${req.headers.host}${baseDir}`;
            res.json(response);
          });

        // pdf.create(data, options).toBuffer(function (err, buffer) {
        // 	if (err) return res.send(err);

        // 	res.setHeader("Content-Type","application/pdf");
        // 	res.setHeader('Content-Disposition', 'inline; filename=${arImageFile[0]}.pdf');
        // 	res.end(buffer, 'binary');
        // });
      }
    }
  );
});

app.listen(3000);
