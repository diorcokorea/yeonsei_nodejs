// fileUpload.js

let fs = require("fs");
const multer = require("multer"); // npm install multer

module.exports = (app) => {
  const upload = multer({ dest: "./media" });
  //   app.post("/uploadphoto",upload.single('myImage'),(req,res)=>{
  //     var img = fs.readFileSync(req.file.path);
  //     var encode_img = img.toString('base64');
  //     var final_img = {
  //         contentType:req.file.mimetype,
  //         image:new Buffer(encode_img,'base64')
  //     };
  //     image.create(final_img,function(err,result){
  //         if(err){
  //             console.log(err);
  //         }else{
  //             console.log(result.img.Buffer);
  //             console.log("Saved To database");
  //             res.contentType(final_img.contentType);
  //             res.send(final_img.image);
  //         }
  //     })
  // })
  app.post("/fileupload", (req, res) => {
    let path = req.query.path;
    if (!path) path = "./media";
    console.log(path);
    const storage = multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, `${path}`); //업로드 파일의 저장 위치를 설정
      },
      filename: (req, file, callback) => {
        callback(null, `${file.originalname}`); // 파일이 저장될 때 이름 설정
      },
    });

    const limits = {
      files: 50,
      fileSize: 1024 * 1024 * 1024, //1G
    };

    const upload = multer({ storage, limits }).any();

    const reqFiles = [];

    upload(req, res, (err) => {
      console.log(req.files);
      if (err) {
        return res.json({ success: false, err });
      }

      for (let i = 0; i < req.files.length; i++) {
        reqFiles.push(req.files[i].filename);
      }

      //reqFiles.push(req.file.fileName);

      return res.json({
        success: true,
        //url: req.file.destination,
        filename: reqFiles,
        //fileName:req.file.originalname
      });
    });
    return;
  });
};
