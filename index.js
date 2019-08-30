// running:
// `watchify index.js -o bundle.js`
//
// references:
// 1. https://medium.com/jeremy-keeshin/hello-world-for-javascript-with-npm-modules-in-the-browser-6020f82d1072
// 2. https://javascript.info/
// 3.

//import * as dat from 'dat.gui';
const dat = require('dat.gui');

let controls = {
  background: '#000000',
  modifyStroke: true,
  rotations: 6
};
let gui = new dat.GUI();
gui.addColor(controls, 'background');
gui.add(controls, 'modifyStroke')
gui.add(controls, 'rotations', 3, 50, 1);

// create canvas element and append it to document body
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// get canvas 2D context and set to correct size
const ctx = canvas.getContext('2d');
resize();

// set up draw state
let position = { x: 0, y: 0 };
const strokeSizeBounds = { min: 1, max: 10 }
let hue = 0;
let direction = true;
let totalDistance = 0;

window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mouseenter', setPosition);
document.addEventListener('keypress', clear);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = '#BADA55';
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	//ctx.lineWidth = 20;
	//ctx.filter = 'blur(8px)';

	ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 28;
  ctx.shadowColor = 'rgba(0, 0, 0, 1.0)';
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function distance(first, second) {
  dx = second.x - first.x
  dy = second.y - first.y
  return Math.sqrt(dx * dx + dy * dy)
}

function setPosition(e) {
  [position.x, position.y] = [e.offsetX, e.offsetY];
}

function draw(e) {
	canvas.style.backgroundColor = controls.background; 

	if (e.buttons !== 1) return;

	hue++;
	if (hue >= 360) {
		hue = 0;
	}

	ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
	ctx.strokeStyle = '#FFFFFF';

	if (controls.modifyStroke) {
			if (ctx.lineWidth >= strokeSizeBounds.max || ctx.lineWidth <= strokeSizeBounds.min) {
				direction = !direction;
			}
			if (direction) {
				ctx.lineWidth++;
			} else {
				ctx.lineWidth--;
			}
	} else {
		ctx.lineWidth = strokeSizeBounds.max;
	}

  drawLineWithSymmetry(position, e);

  setPosition(e);
}

function drawLine(start, end) {
	ctx.moveTo(start.x, start.y); 
	ctx.lineTo(end.x, end.y); 
}

const symmetries = {
	axial: [],
	radial: []
}
const tranforms = {}

function drawLineWithSymmetry(start, end) {
	ctx.beginPath();

	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	drawLine(start, end);
	ctx.restore();

	const mirror = false;

	if (mirror) {
		ctx.save();
		ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
		drawLine(start, end);
		ctx.restore();

		ctx.save();
		ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
		drawLine(start, end);
		ctx.restore();

		ctx.save();
		ctx.setTransform(-1, 0, 0, -1, canvas.width, canvas.height);
		drawLine(start, end);
		ctx.restore();
	} else {
		const divisions = controls.rotations;
		const theta = (Math.PI * 2.0) / divisions;
		const cx = canvas.width * 0.5;
		const cy = canvas.height * 0.5;
		
		for (let i = 0; i < divisions; i++) {
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(theta * i);
			ctx.translate(-cx, -cy);
			drawLine(start, end);

			ctx.restore();
		}
	}

	ctx.stroke();
}