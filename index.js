//import * as dat from 'dat.gui';
const dat = require('dat.gui');

let controls = {
  color: '#000000',
  modifyStroke: true
};
let gui = new dat.GUI();
gui.addColor(controls, 'color');
gui.add(controls, 'modifyStroke')

// create canvas element and append it to document body
const canvas = document.createElement('canvas');
resize();
document.body.appendChild(canvas);

// get canvas 2D context and set to correct size
const ctx = canvas.getContext('2d');
ctx.strokeStyle = '#BADA55';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 20;
//ctx.globalCompositeOperation = 'multiply';

// set up draw state
let position = { x: 0, y: 0 };
const strokeSizeBounds = { min: 1, max: 20 }
let hue = 0;
let direction = true;
let totalDistance = 0;

window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);
document.addEventListener('keypress', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
	if (e.buttons !== 1) return;

	hue++;
	if (hue >= 360) {
		hue = 0;
	}

	ctx.strokeStyle = controls.color;
	// `hsl(${hue}, 100%, 50%)`;

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
	ctx.beginPath()
	ctx.moveTo(start.x, start.y); 
	ctx.lineTo(end.x, end.y); 
	ctx.stroke();
}

const symmetries = {
	axial: [],
	radial: []
}
const tranforms = {}

function drawLineWithSymmetry(start, end) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	drawLine(start, end);
	ctx.restore();

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
}