//<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
//<script src="https://unpkg.com/konva@8/konva.min.js"></script>

const SOURCE_FILE_PATH_SESSION_KEY = "SOURCE_FILE_PATH_SESSION_KEY";
const SOURCE_LAWDATA_SESSION_KEY = "SOURCE_LAWDATA_SESSION_KEY";
const SOURCE_STAGE_POSITION_SESSION_KEY = "SOURCE_STAGE_POSITION_SESSION_KEY";
const SOURCE_IMAGE_POSITION_SESSION_KEY = "SOURCE_IMAGE_POSITION_SESSION_KEY";
const SOURCE_IMAGE_SCALE_SESSION_KEY = "SOURCE_IMAGE_SCALE_SESSION_KEY";
const SOURCE_SIDE_DEFAULT_IMAGE_SEESION_KEY = "SOURCE_SIDE_DEFAULT_IMAGE_SEESION_KEY";

const RESULT_IMAGE_LAWDATA_SESSION_KEY = "RESULT_IMAGE_LAWDATA_SESSION_KEY";
const RESULT_JSON_SESSION_KEY = "RESULT_JSON_SESSION_KEY";
const RESULT_STAGE_POSITION_SESSION_KEY = "RESULT_STAGE_POSITION_SESSION_KEY";
const RESULT_IMAGE_POSITION_SESSION_KEY = "RESULT_IMAGE_POSITION_SESSION_KEY";
const RESULT_IMAGE_SCALE_SESSION_KEY = "RESULT_IMAGE_SCALE_SESSION_KEY";
const RESULT_SIDE_DEFAULT_IMAGE_SEESION_KEY = "RESULT_SIDE_DEFAULT_IMAGE_SEESION_KEY";


const STATE_SESSION_KEY = "STATE_SESSION_KEY";
const LAST_VISIABLE_MODE_SESSION_KEY = "LAST_VISIABLE_MODE_SESSION_KEY";
const CLASSIFICATION_SESSION_KEY = "CLASSIFICATION_SESSION_KEY";


const NORMAL_STATE = 0x00000001;
const ABNORMAL_STATE = 0x00000002;

function CreateSide(is_source_image, img)
{
	let elem = document.getElementById(GetSideName(is_source_image));
	let rect = elem.getBoundingClientRect();

	let width = rect.width;
	let height = rect.height;

	let img_width = img.width;
	let img_height = img.height;

	let min = Math.min(width, height);
	let ratio = (img_width > img_height ? (img_width / min) : (img_height / min))


	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	canvas.width = width;
	canvas.height = height;
	context.drawImage(img,
		(width - (img_width/ratio))/2.0,
		(height - (img_height/ratio))/2.0,
		img_width/ratio,
		img_height/ratio
	);
	elem.onclick = function() 
	{
		if(is_source_image === true)
		{
			localStorage.setItem(LAST_VISIABLE_MODE_SESSION_KEY, "true")
			let img = new Image();
			img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);

			img.onload = function ()
			{
				CreateSide(true, img);
				if(JSON.parse(localStorage.getItem(LAST_VISIABLE_MODE_SESSION_KEY)) === true)
				{
					ContainerVisibility(true, true);
					ContainerVisibility(false, false);
					CreateCenter(true, img, 
						JSON.parse(localStorage.getItem(SOURCE_IMAGE_POSITION_SESSION_KEY)), 
						JSON.parse(localStorage.getItem(SOURCE_IMAGE_SCALE_SESSION_KEY)), 
						JSON.parse(localStorage.getItem(SOURCE_STAGE_POSITION_SESSION_KEY)), null, null, null);
				}
			}
		}
		else
		{
			if(localStorage.getItem(RESULT_IMAGE_LAWDATA_SESSION_KEY) !== null)
			{
				localStorage.setItem(LAST_VISIABLE_MODE_SESSION_KEY, "false")
				let thumbnail_image = new Image();
				thumbnail_image.src = localStorage.getItem(RESULT_IMAGE_LAWDATA_SESSION_KEY);
				
				thumbnail_image.onload = function ()
				{
					
					CreateSide(false, thumbnail_image);
					if(JSON.parse(localStorage.getItem(LAST_VISIABLE_MODE_SESSION_KEY)) === false)
					{
						ContainerVisibility(true, false);
						ContainerVisibility(false, true);
						let img = new Image();
						img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);
						img.onload = function()
						{
							CreateCenter(false, img, 
								JSON.parse(localStorage.getItem(RESULT_IMAGE_POSITION_SESSION_KEY)), 
								JSON.parse(localStorage.getItem(RESULT_IMAGE_SCALE_SESSION_KEY)),
								JSON.parse(localStorage.getItem(RESULT_STAGE_POSITION_SESSION_KEY)), 
								JSON.parse(localStorage.getItem(RESULT_JSON_SESSION_KEY)), 
								localStorage.getItem(STATE_SESSION_KEY), null);
						}
					}
				}
			}
		}
	};

	document.getElementById(GetSideName(is_source_image)).src = canvas.toDataURL();			
}

function ContainerVisibility(is_source_image, bVisibile)
{
	let elem = document.getElementById(GetContainerName(is_source_image));
	if(bVisibile === true)
	{
		elem.style.display = "inline-block";
		elem.style.visibility ="visible";
	}
	else
	{
		elem.style.display = "none";
		elem.style.visibility ="hidden";
	}
}
function GetContainerName(is_source_image)
{
	return (is_source_image === true ? 'source_container' : 'result_container');
}
function GetSideName(is_source_image)
{
	return (is_source_image === true ? 'Side' : 'Side_x');
}
function CreateCenter(is_source_image, img, pos, scale, stage_position, result_json, state, make_thumbnail)
{
	let elem = document.getElementById(GetContainerName(is_source_image));

	let rect = elem.getBoundingClientRect();
	let width = rect.width;
	let height = rect.height;
	
	let stage = new Konva.Stage({container: GetContainerName(is_source_image), width: width, height: height});
	let layer = new Konva.Layer({name: 'Layer'});
	stage.add(layer);

	let img_width = img.width;
	let img_height = img.height;

	let min = Math.min(width, height);
	let ratio = (img_width > img_height ? (img_width / min) : (img_height / min))

	let group = new Konva.Group(
	{
    	draggable: true,
    });

	if(pos !== null)
	{
		const transform = group.getAbsoluteTransform();
		for(let i = 0; i < transform.m.length; i++)
			transform.m[i] = pos.m[i];

		group.setAttrs(transform.decompose());
	}
	else
	{
		const transform = group.getAbsoluteTransform();
		const matrix = transform.getMatrix();
		transform.translate((width - ((img_width/ratio)))/2.0, (height - ((img_height/ratio)))/2.0);
		transform.scale(1.0/ratio, 1.0/ratio);

		group.setAttrs(transform.decompose());

		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_POSITION_SESSION_KEY : RESULT_IMAGE_POSITION_SESSION_KEY, JSON.stringify(group.getAbsoluteTransform().copy()));
	}
	let slider = document.getElementById('bar');
	if(scale !== null)
	{
		slider.value = parseFloat(scale);
	}
	else
	{
		slider.value = 0.0;
		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_SCALE_SESSION_KEY : RESULT_IMAGE_SCALE_SESSION_KEY, JSON.stringify(0.0));
	}
	
	let theImg = new Konva.Image(
	{
		image: img,
		x: 0,
		y: 0,
		width: img_width,
		height: img_height,
		draggable: false,
		rotation: 0,
		centeredScaling: true
	});

	group.on('mouseover', function ()
	{
		document.body.style.cursor = 'pointer';

	});
	group.on('mouseout', function ()
	{
		document.body.style.cursor = 'default';
	});

	//const transformer = new Konva.Transformer();
	//transformer.nodes([theImg]);
	group.add(theImg);
	
	if(is_source_image === false && result_json !== null)
	{
		for (let i = 0; i < result_json.results.length; i++)
		{
			let x = result_json.results[i].position[0];
			let y = result_json.results[i].position[1];

			let w = result_json.results[i].position[2] - x;
			let h = result_json.results[i].position[3] - y;

			if(w < 0 || h < 0)
			{
				console.log("Exception : %d", i);
				continue;
			}
			if(((state & NORMAL_STATE) && result_json.results[i].class == 1) || ((state & ABNORMAL_STATE) && result_json.results[i].class == 2))
			{
				if(result_json.results[i].class === 1)
					color = 'blue';
				else
					color = 'red';
				let rect1 = new Konva.Rect(
				{
					x: x,
					y: y,
					width: w,
					height: h,
					stroke: color,
					strokeWidth: 2,
					draggable: false,
					rotation: 0,
					opacity: 0.5,
					centeredScaling: true
				});
				//const transformer = new Konva.Transformer();
				//transformer.nodes([rect1]);
				//layer.add(transformer);
				//const oldNodes = transformer.nodes();
				//const newNodes = oldNodes.concat([rect1]);
				//transformer.nodes(newNodes);
				group.add(rect1);

				// rect1.on('mouseenter', function ()
				// {
				// 	this.opacity(0.8);
				// });
			
				// rect1.on('mouseleave', function ()
				// {
				// 	this.opacity(0.5);
				// });
				// rect1.on('click', function () 
				// {
				// 	if(result_json.results[i].class == 1)
				// 	{
				// 		let fill = (this.fill() === undefined || this.fill() === '#00000000') ? 'blue' : '#00000000';
				// 		this.fill(fill);
				// 	}
				// 	else
				// 	{
				// 		let fill = (this.fill() == undefined || this.fill() === '#00000000') ? 'red' : '#00000000';
				// 		this.fill(fill);
				// 	}
				// });
			}
		}
	}

	//layer.add(transformer);
	layer.add(group);
	layer.draw();

	

	let thumbnail_image = null;
	if(is_source_image === false && make_thumbnail === true)
	{
		
		thumbnail_image = group.toDataURL({ mimeType: 'image/png', x : group.position().x, y : group.position().y, width: group.getWidth(), height: group.getHeight(), quality: 1, pixelRadio: 2, })
	}

	

	// if(stage_position !== null)
	// {
	// 	stage.position(stage_position);
	// }
	// else
	// {
	// 	localStorage.setItem(is_source_image === true ? SOURCE_STAGE_POSITION_SESSION_KEY : RESULT_STAGE_POSITION_SESSION_KEY, JSON.stringify(stage.getPosition()));
	// }

	stage.on('wheel', (e) => 
	{
		e.evt.preventDefault();
		
		let pointer = group.position();
		const transform = group.getAbsoluteTransform();
		const matrix = transform.getMatrix();

		slider.value = parseFloat(slider.value) + (e.evt.deltaY > 0 ? 0.1 : -0.1);
		if(slider.value < 0)
		 	slider.value = 0;
		else if(slider.value > 10)
			slider.value = 10;

		pointer.x += (theImg.getWidth() * transform.m[0])/2.0; //Centor X
		pointer.y += (theImg.getHeight() * transform.m[3])/2.0; //Centor Y

		pointer.x -= (theImg.getWidth() * (1.0/ratio + parseFloat(slider.value)))/2.0;
		pointer.y -= (theImg.getHeight() * (1.0/ratio + parseFloat(slider.value)))/2.0;

		transform.m[0] = transform.m[3] = 1.0/ratio + parseFloat(slider.value);
		transform.m[4] = pointer.x;
		transform.m[5] = pointer.y;
		group.setAttrs(transform.decompose());
		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_SCALE_SESSION_KEY : RESULT_IMAGE_SCALE_SESSION_KEY, JSON.stringify(slider.value));
		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_POSITION_SESSION_KEY : RESULT_IMAGE_POSITION_SESSION_KEY, JSON.stringify(group.getAbsoluteTransform().copy()));
		
		// group.setAttrs(transform.decompose());
		// localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_POSITION_SESSION_KEY : RESULT_IMAGE_POSITION_SESSION_KEY, JSON.stringify(group.getAbsoluteTransform().copy()));

		// let oldScale = stage.scaleX();
		// let pointer = group.position();
		
		// pointer.x += (theImg.getWidth() * 1.0/ratio)/2.0;
		// pointer.y += (theImg.getHeight() * 1.0/ratio)/2.0;
		// let mousePointTo = 
		// {
		// 	x: (pointer.x - stage.x()) / oldScale,
		// 	y: (pointer.y - stage.y()) / oldScale
		// };
		// slider.value = parseFloat(slider.value) + (e.evt.deltaY > 0 ? 0.1 : -0.1);
		// if(slider.value < 0)
		// 	slider.value = 0;
		// if(slider.value > 10)
		// 	slider.value = 10;
		
		// stage.scale({x: slider.value, y: slider.value});
		// let newPos =
		// {
		// 	x: pointer.x - mousePointTo.x * slider.value,
		// 	y: pointer.y - mousePointTo.y * slider.value
		// };

		// localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_SCALE_SESSION_KEY : RESULT_IMAGE_SCALE_SESSION_KEY, JSON.stringify(slider.value));
		// localStorage.setItem(is_source_image === true ? SOURCE_STAGE_POSITION_SESSION_KEY : RESULT_STAGE_POSITION_SESSION_KEY, JSON.stringify(newPos));
		// stage.position(newPos);
		//console.log("wheel2 : %s[%f, %s], %f", JSON.stringify(group.getAbsoluteTransform()), 1.0/ratio, slider.value, newScale);
	});

	slider.oninput = function ()
	{
		let pointer = group.position();
		const transform = group.getAbsoluteTransform();
		const matrix = transform.getMatrix();
		
		pointer.x += (theImg.getWidth() * transform.m[0])/2.0; //Centor X
		pointer.y += (theImg.getHeight() * transform.m[3])/2.0; //Centor Y

		pointer.x -= (theImg.getWidth() * (1.0/ratio + parseFloat(slider.value)))/2.0;
		pointer.y -= (theImg.getHeight() * (1.0/ratio + parseFloat(slider.value)))/2.0;

		transform.m[0] = transform.m[3] = 1.0/ratio + parseFloat(slider.value);
		transform.m[4] = pointer.x;
		transform.m[5] = pointer.y;
		group.setAttrs(transform.decompose());
		
		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_SCALE_SESSION_KEY : RESULT_IMAGE_SCALE_SESSION_KEY, JSON.stringify(slider.value));
		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_POSITION_SESSION_KEY : RESULT_IMAGE_POSITION_SESSION_KEY, JSON.stringify(group.getAbsoluteTransform().copy()));

		// let oldScale = stage.scaleX();
		// let pointer = group.position();
		
		// pointer.x += (theImg.getWidth() * 1.0/ratio)/2.0;
		// pointer.y += (theImg.getHeight() * 1.0/ratio)/2.0;
		// let mousePointTo = {
		// 	x: (pointer.x - stage.x()) / oldScale,
		// 	y: (pointer.y - stage.y()) / oldScale
		// };
		// stage.scale({x: slider.value, y: slider.value});
		// let newPos = {
		// 	x: pointer.x - mousePointTo.x * slider.value,
		// 	y: pointer.y - mousePointTo.y * slider.value
		// };

		// 
		// localStorage.setItem(is_source_image === true ? SOURCE_STAGE_POSITION_SESSION_KEY : RESULT_STAGE_POSITION_SESSION_KEY, JSON.stringify(newPos));
		// stage.position(newPos);

		// console.log("slider : %s",JSON.stringify(group.getAbsoluteTransform()))
	};
	group.on('dragend', function (e)
	{
		localStorage.setItem(is_source_image === true ? SOURCE_IMAGE_POSITION_SESSION_KEY : RESULT_IMAGE_POSITION_SESSION_KEY, JSON.stringify(group.getAbsoluteTransform().copy()));
		//console.log("dragend : %s", JSON.stringify(group.getAbsoluteTransform().copy()))
	});
	return thumbnail_image;
}
function fileUpload(e)
{

	let URL = window.webkitURL || window.URL;
	if(e.target.files.length == 0)
		return;
	let url = URL.createObjectURL(e.target.files[0]);

	let img = new Image();
	img.src = url;

	img.onload = function ()
	{
		document.getElementById("filepath").innerHTML = e.target.files[0].name;
		getBase64(e.target.files[0]).then(
			(data) => 
			{
				localStorage.setItem(SOURCE_LAWDATA_SESSION_KEY, data);
				localStorage.setItem(LAST_VISIABLE_MODE_SESSION_KEY, "true");
				localStorage.setItem(SOURCE_FILE_PATH_SESSION_KEY, e.target.files[0].name);

				localStorage.removeItem(SOURCE_STAGE_POSITION_SESSION_KEY);
				localStorage.removeItem(SOURCE_IMAGE_POSITION_SESSION_KEY);
				localStorage.removeItem(SOURCE_IMAGE_SCALE_SESSION_KEY);

				localStorage.removeItem(RESULT_IMAGE_LAWDATA_SESSION_KEY);
				localStorage.removeItem(RESULT_JSON_SESSION_KEY);
				localStorage.removeItem(RESULT_STAGE_POSITION_SESSION_KEY);
				localStorage.removeItem(RESULT_IMAGE_POSITION_SESSION_KEY);
				localStorage.removeItem(RESULT_IMAGE_SCALE_SESSION_KEY);


				document.getElementById(GetSideName(false)).src = localStorage.getItem(SOURCE_SIDE_DEFAULT_IMAGE_SEESION_KEY);
				document.getElementById(GetSideName(false)).removeAttribute("onclick");
				CreateSide(true, img);
				ContainerVisibility(true, true)
				ContainerVisibility(false, false)
				CreateCenter(true, img, null, null, null, null, null, null);
			}
		 );

		
	};
}
                    

function reading(event)
{
	event.preventDefault();
	$(document).ajaxStart(function()
	{
		//alert("ajax Start");
	});

	$(document).ajaxStop(function()
	{
		//alert("ajax Stop");
	});
	classification = event;//document.querySelector('input[name="classification"]:checked').value;
	$.ajax(
	{
		url : '/reading',
		type : 'POST',
		dataType: 'json',
        contentType: 'application/json; charset=utf-8',
		data : JSON.stringify({"image" : localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY), "filepath" : localStorage.getItem(SOURCE_FILE_PATH_SESSION_KEY), 
	"classification" : classification}),
		timeout : 10000000,
		success : function(obj)
		{

			if(obj.success === true)
			{
				let img = new Image();
				img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);

				img.onload = function ()
				{
					localStorage.setItem(LAST_VISIABLE_MODE_SESSION_KEY, "false");
					document.getElementById("normal").checked = true;
					document.getElementById("abnormal").checked = true;
					let state = NORMAL_STATE | ABNORMAL_STATE;
					localStorage.setItem(STATE_SESSION_KEY, state);


					ContainerVisibility(true, false)
					ContainerVisibility(false, true)
					let thumbnail_image = new Image();
					thumbnail_image.src = CreateCenter(false, img, null, null, null, JSON.parse(obj.result_json), localStorage.getItem(STATE_SESSION_KEY), true);
					localStorage.setItem(RESULT_IMAGE_LAWDATA_SESSION_KEY, thumbnail_image.src);
					localStorage.setItem(RESULT_JSON_SESSION_KEY, obj.result_json);
					thumbnail_image.onload = function () {
						
						CreateSide(false, thumbnail_image);
					}
				}

			}
			else
			{
				let message = "error : " +  obj.reason;
				alert(message);
			}
		},
		error : function(e)
		{
			let message = "error : " + e;
			alert(message);
		},
	});
	
}

function report(event)
{

	// let parameters = {filepath: localStorage.getItem(SOURCE_FILE_PATH_SESSION_KEY)};
	// console.log(parameters);

	// let headers = new Headers();
	// headers.append('X-CSRFToken', csrftoken);
	// headers.append('Accept', 'application/json, text/plain, */*');
	// headers.append('Content-Type', 'application/x-www-form-urlencoded');

	// fetch('/pdfgen', {
	// 	method: 'POST',
	// 	headers: headers,
	// 	body: JSON.stringify(parameters)
	// }).then((response) => console.log(response));
	event.preventDefault();
	$(document).ajaxStart(function()
	{
		//alert("ajax Start");
	});

	$(document).ajaxStop(function()
	{
		//alert("ajax Stop");
	});

	$.ajax(
	{
		url : '/pdfgen',
		type : 'POST',
		contentType: 'application/json; charset=utf-8',
		xhr: function() {
			const xhr = new XMLHttpRequest();
			xhr.responseType= 'blob'
			return xhr;
		  },
		data : JSON.stringify({"image" : localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY), "filepath" : localStorage.getItem(SOURCE_FILE_PATH_SESSION_KEY)}),
		timeout : 10000000,
		success : function(blob)
		{

			var file = new Blob([blob], { type: 'application/pdf' });
   			var fileURL = URL.createObjectURL(file);
   			window.open(fileURL, '_blank');
		},
		error : function(e)
		{
			let message = "error : " + e;
			alert(message);
		},
	});
	// var xhr = new XMLHttpRequest();
	// xhr.open('GET', '/pdfgen', true);
	// xhr.responseType = 'blob';

	// xhr.onload = function(e) {
	// if (this.status == 200) {
	// 	var blob = new Blob([this.response], {type: 'application/pdf'}),
	// 	fileURL = URL.createObjectURL(blob);
	// 	window.open(fileURL,'_blank');
	// }
	// };

	// xhr.send();
}
function changeClassification(event)
{
	localStorage.setItem(CLASSIFICATION_SESSION_KEY, event.value);
}
function changeState(event)
{
	let state = 0;
	if(localStorage.getItem(STATE_SESSION_KEY) !== null)
	{
		state = parseInt(localStorage.getItem(STATE_SESSION_KEY));
	}
	if(event.id === "normal")
	{
		if(event.checked === true)
			state |= NORMAL_STATE;
		else
			state &= ~NORMAL_STATE;
	}
	else if(event.id === "abnormal")
	{
		if(event.checked === true)
			state |= ABNORMAL_STATE;
		else
			state &= ~ABNORMAL_STATE;
	}
	localStorage.setItem(STATE_SESSION_KEY, state);


	let img = new Image();
	img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);

	img.onload = function ()
	{
		localStorage.setItem(LAST_VISIABLE_MODE_SESSION_KEY, "false");
		
		ContainerVisibility(true, false)
		ContainerVisibility(false, true)
		let thumbnail_image = new Image();
		CreateCenter(false, img, 
			JSON.parse(localStorage.getItem(RESULT_IMAGE_POSITION_SESSION_KEY)), 
			JSON.parse(localStorage.getItem(RESULT_IMAGE_SCALE_SESSION_KEY)), 
			JSON.parse(localStorage.getItem(RESULT_STAGE_POSITION_SESSION_KEY)), 
			JSON.parse(localStorage.getItem(RESULT_JSON_SESSION_KEY)), 
			localStorage.getItem(STATE_SESSION_KEY), false);
		thumbnail_image.src = localStorage.getItem(RESULT_IMAGE_LAWDATA_SESSION_KEY);
		//localStorage.setItem(RESULT_IMAGE_LAWDATA_SESSION_KEY, thumbnail_image.src);
		thumbnail_image.onload = function () {
			
			CreateSide(false, thumbnail_image);
		}
	}

	//console.log("%s : %s", event.id, event.checked === true ? "TRUE" : "FALSE");
}
function getCookie(name)
{
    var cookieValue = null;
    if (document.cookie && document.cookie !== '')
	{
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++)
		{
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '='))
			{
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method)
{
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup(
{
    beforeSend: function(xhr, settings)
	{
        if (!csrfSafeMethod(settings.type) && !this.crossDomain)
		{
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});
function getBase64(file)
{
	return new Promise((resolve, reject) => 
	{
	  const reader = new FileReader();
	  reader.readAsDataURL(file);
	  reader.onload = () => resolve(reader.result);
	  reader.onerror = error => reject(error);
	});
}
function decimalToHexString(number)
{
  if (number < 0)
  {
    number = 0xFFFFFFFF + number + 1;
  }

  return number.toString(16).toUpperCase();
}
window.onload = function()
{
	
	localStorage.setItem(SOURCE_SIDE_DEFAULT_IMAGE_SEESION_KEY, document.getElementById(GetSideName(true)).src);
	localStorage.setItem(RESULT_SIDE_DEFAULT_IMAGE_SEESION_KEY, document.getElementById(GetSideName(false)).src);
	if(localStorage.length > 0)
	{

		if(localStorage.getItem(SOURCE_FILE_PATH_SESSION_KEY) !== null)
			document.getElementById("filepath").innerHTML = localStorage.getItem(SOURCE_FILE_PATH_SESSION_KEY);


		if(localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY) !== null)
		{
			let img = new Image();
			img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);

			img.onload = function () 
			{
				CreateSide(true, img);
				if(JSON.parse(localStorage.getItem(LAST_VISIABLE_MODE_SESSION_KEY)) === true)
				{
					ContainerVisibility(true, true);
					ContainerVisibility(false, false);
					CreateCenter(true, img, JSON.parse(localStorage.getItem(SOURCE_IMAGE_POSITION_SESSION_KEY)), JSON.parse(localStorage.getItem(SOURCE_IMAGE_SCALE_SESSION_KEY)), 
					JSON.parse(localStorage.getItem(SOURCE_STAGE_POSITION_SESSION_KEY)), null, null, null);
				}
			}
		}

		let state = NORMAL_STATE | ABNORMAL_STATE;
		if(localStorage.getItem(STATE_SESSION_KEY) === null)
		{
			document.getElementById("normal").checked = true;
			document.getElementById("abnormal").checked = true;
			localStorage.setItem(STATE_SESSION_KEY, state);
		}
		else
		{
			state = parseInt(localStorage.getItem(STATE_SESSION_KEY));
			if(state & NORMAL_STATE)
				document.getElementById("normal").checked = true;
			else
				document.getElementById("normal").checked = false;

			if(state & ABNORMAL_STATE)
				document.getElementById("abnormal").checked = true;
			else
				document.getElementById("abnormal").checked = false;
		}

		if(localStorage.getItem(CLASSIFICATION_SESSION_KEY) !== null)
		{
			if(localStorage.getItem(CLASSIFICATION_SESSION_KEY) === "stable")
			{
				$("#_stable").prop("checked", true);
			}
			else
			{
				$("#_unstable").prop("checked", true);
			}
		}
		else
		{
			$("#_stable").prop("checked", true);
			localStorage.setItem(CLASSIFICATION_SESSION_KEY, document.querySelector('input[name="classification"]:checked').value);
		}


		if(localStorage.getItem(RESULT_IMAGE_LAWDATA_SESSION_KEY) !== null)
		{
			let thumbnail_image = new Image();
			thumbnail_image.src = localStorage.getItem(RESULT_IMAGE_LAWDATA_SESSION_KEY);

			thumbnail_image.onload = function ()
			{
				CreateSide(false, thumbnail_image);
				if(JSON.parse(localStorage.getItem(LAST_VISIABLE_MODE_SESSION_KEY)) === false)
				{
					ContainerVisibility(true, false);
					ContainerVisibility(false, true);
					let img = new Image();
					img.src = localStorage.getItem(SOURCE_LAWDATA_SESSION_KEY);
					img.onload = function()
					{
						CreateCenter(false, img, 
							JSON.parse(localStorage.getItem(RESULT_IMAGE_POSITION_SESSION_KEY)), 
							JSON.parse(localStorage.getItem(RESULT_IMAGE_SCALE_SESSION_KEY)), 
							JSON.parse(localStorage.getItem(RESULT_STAGE_POSITION_SESSION_KEY)), 
							JSON.parse(localStorage.getItem(RESULT_JSON_SESSION_KEY)), 
							localStorage.getItem(STATE_SESSION_KEY), null);
					}
				}
			}
			
		}
		

	}
}