//<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
//<script src="https://unpkg.com/konva@8/konva.min.js"></script>

function CreateSide(img) {
	let elem = document.getElementById('Side');
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

	document.getElementById("Side").src = canvas.toDataURL();			
}
function CreateCenter(img) {
	let elem = document.getElementById('container');
	let rect = elem.getBoundingClientRect();
	let width = rect.width;
	let height = rect.height;

	let stage = new Konva.Stage({container: 'container', width: width, height: height});
	let layer = new Konva.Layer({name: 'layer'});
	stage.add(layer);

	let img_width = img.width;
	let img_height = img.height;

	let min = Math.min(width, height);
	let ratio = (img_width > img_height ? (img_width / min) : (img_height / min))

	

	let theImg = new Konva.Image({
		image: img,
		x: (width - ((img_width/ratio)))/2.0,
		y: (height -((img_height/ratio)))/2.0,
		width: (img_width/ratio),
		height: (img_height/ratio),
		draggable: true,
		rotation: 0,
		centeredScaling: true
	});
	theImg.on('mouseover', function () {
		document.body.style.cursor = 'pointer';

	});
	theImg.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});
	

	layer.add(theImg);
	layer.draw();

	let slider = document.getElementById('bar');
	if(slider !== null)
	{
		stage.on('wheel', (e) => {
			e.evt.preventDefault();

			let oldScale = stage.scaleX();
			let pointer = theImg.position();
			
			pointer.x += theImg.getWidth()/2.0;
			pointer.y += theImg.getHeight()/2.0;
			let mousePointTo = {
				x: (pointer.x - stage.x()) / oldScale,
				y: (pointer.y - stage.y()) / oldScale
			};
			slider.value = parseFloat(slider.value) + (e.evt.deltaY > 0 ? 0.1 : -0.1);
			if(slider.value < 0)
				slider.value = 0;
			if(slider.value > 10)
				slider.value = 10;
			
			stage.scale({x: slider.value, y: slider.value});
			let newPos = {
				x: pointer.x - mousePointTo.x * slider.value,
				y: pointer.y - mousePointTo.y * slider.value
			};

			stage.position(newPos);
		});

		slider.oninput = function () {
			let oldScale = stage.scaleX();
			let pointer = theImg.position();
			
			pointer.x += theImg.getWidth()/2.0;
			pointer.y += theImg.getHeight()/2.0;
			let mousePointTo = {
				x: (pointer.x - stage.x()) / oldScale,
				y: (pointer.y - stage.y()) / oldScale
			};
			stage.scale({x: slider.value, y: slider.value});
			let newPos = {
				x: pointer.x - mousePointTo.x * slider.value,
				y: pointer.y - mousePointTo.y * slider.value
			};

			stage.position(newPos);
		};
	}
}
function fileUpload(e) {

	let URL = window.webkitURL || window.URL;
	if(e.target.files.length == 0)
		return;
	let url = URL.createObjectURL(e.target.files[0]);

	let img = new Image();
	img.src = url;

	img.onload = function () {
		document.getElementById("n_6067_7544_0059jpg").innerHTML = e.target.files[0].name;
		CreateSide(img);
		CreateCenter(img);
	};
}