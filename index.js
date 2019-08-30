// running:
// `watchify index.js -o bundle.js`
//
// references:
// 1. https://medium.com/jeremy-keeshin/hello-world-for-javascript-with-npm-modules-in-the-browser-6020f82d1072
// 2. https://javascript.info/
// 3. https://www.npmjs.com/package/simplex-noise

// this should work in es6 (something wrong with browserify?)
//import * as dat from 'dat.gui';
const dat = require('dat.gui');
const SimplexNoise = require('simplex-noise');

const simplex = new SimplexNoise();

// setup the gui
let controls = {
  background: '#000000',
  animateStroke: true,
  applyShadows: true,
  hsvBrush: false,
  rotations: 6
};
let gui = new dat.GUI();
const controller0 = gui.addColor(controls, 'background');
const controller1 = gui.add(controls, 'animateStroke');
const controller2 = gui.add(controls, 'applyShadows');
const controller3 = gui.add(controls, 'hsvBrush');
const controller4 = gui.add(controls, 'rotations', 3, 50, 1);
controller2.onChange(setDrawState);

// create canvas element and append it to document body
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// get canvas 2D context and set to correct size
const ctx = canvas.getContext('2d');
resize();

// set up draw state
let position = { x: canvas.width*0.5, y: canvas.height*0.5 };
const strokeSizeBounds = { min: 1, max: 10 }
let hue = 0;
let direction = true;

window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mouseenter', setPosition);
document.addEventListener('keypress', clear);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  setDrawState();
}

function setDrawState() {
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	if (controls.applyShadows) {
		ctx.shadowOffsetX = 2;
	  ctx.shadowOffsetY = 2;
	  ctx.shadowBlur = 28;
	  ctx.shadowColor = 'rgba(0, 0, 0, 1.0)';
	} else {
		ctx.shadowColor = 'rgba(0, 0, 0, 0.0)';
	}
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function distance(first, second) {
  [dx, dy] = [second.x - first.x, second.y - first.y];
  return Math.sqrt(dx * dx + dy * dy)
}

function setPosition(e) {
  [position.x, position.y] = [e.offsetX, e.offsetY];
}

function draw(e) {
	// set the current background color
	canvas.style.backgroundColor = controls.background; 

	// is the left mouse button pressed?
	if (e.buttons !== 1) return;

	hue++;
	if (hue >= 360) {
		hue = 0;
	}

	// choose brush color
	if (controls.hsvBrush) {
		ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
	} else {
		ctx.strokeStyle = '#FFFFFF';
	}

	// choose whether or not to animate the line width as the user draws
	if (controls.animateStroke) {
			if (ctx.lineWidth >= strokeSizeBounds.max || ctx.lineWidth <= strokeSizeBounds.min) {
				direction = !direction;
			}
			if (direction) {
				ctx.lineWidth++;
			} else {
				ctx.lineWidth--;
			}
	} else {
		ctx.lineWidth = strokeSizeBounds.max - 1;
	}

	// draw patterns
  drawLineWithSymmetry(position, e);

  // save cursor position
  setPosition(e);
}

function drawLine(start, end) {
	ctx.moveTo(start.x, start.y); 
	ctx.lineTo(end.x, end.y); 
}

function drawLineWithSymmetry(start, end) {
	ctx.beginPath();

	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	drawLine(start, end);
	ctx.restore();

	const mirror = false;

	// mirroring the drawing with odd-numbered rotational symmetry (i.e. 3) is interesting
	if (mirror) {
		// flip y
		ctx.save();
		ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
		drawLine(start, end);
		ctx.restore();

		// flip x
		ctx.save();
		ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
		drawLine(start, end);
		ctx.restore();

		// flip x and y
		ctx.save();
		ctx.setTransform(-1, 0, 0, -1, canvas.width, canvas.height);
		drawLine(start, end);
		ctx.restore();
	} 

	// rotational symmetry
	const divisions = controls.rotations;
	const theta = (Math.PI * 2.0) / divisions;
	const cx = canvas.width * 0.5;
	const cy = canvas.height * 0.5;
	
	for (let i = 0; i < divisions; i++) {
		// randomly drop certain lines
		//if (Math.random() > 0.5) {
			ctx.save();

			// apply rotation around origin
			ctx.translate(cx, cy);
			ctx.rotate(theta * i);
			ctx.translate(-cx, -cy);
			drawLine(start, end);

			ctx.restore();
		//}
	}

	// ctx.filter = 'blur(8px)';
	// ctx.stroke();
	// ctx.filter = 'blur(0px)';
	ctx.stroke();
}

function fadeDrawing() {
	ctx.fillStyle = "rgba(0.0, 0.0, 0.0, 0.005)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// uncomment to slowly clear the canvas as the user draws
//setInterval(fadeDrawing, 10);

// let frame = 0;
// function animateCursor() {
// 	frame += 1;

// 	var d = new Date();
//   var n = frame * 0.02;// / 30.0;//position.x * position.y;//d.getMilliseconds();

// 	const freq = 0.1;
// 	const amp = 200.0;
// 	const valueX = simplex.noise2D( n * freq, (n + 200.22) * freq) * amp;
// 	const valueY = simplex.noise2D(-n * freq, (n + 101.11) * freq) * amp;
	
// 	const end = { x: valueX + canvas.width * 0.5, y: valueY + canvas.height * 0.5 };

// 	// set the current background color
// 	canvas.style.backgroundColor = controls.background; 

// 	// is the left mouse button pressed?
// 	//if (e.buttons !== 1) return;

// 	hue++;
// 	if (hue >= 360) {
// 		hue = 0;
// 	}

// 	// choose brush color
// 	if (controls.hsvBrush) {
// 		ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
// 	} else {
// 		ctx.strokeStyle = '#FFFFFF';
// 	}

// 	// choose whether or not to animate the line width as the user draws
// 	if (controls.animateStroke && frame % 8 == 0) {
			
// 			if (ctx.lineWidth >= strokeSizeBounds.max || ctx.lineWidth <= strokeSizeBounds.min) {
// 				direction = !direction;
// 			}
// 			if (direction) {
// 				ctx.lineWidth++;
// 			} else {
// 				ctx.lineWidth--;

// 			}
// 	} else {
// 		//ctx.lineWidth = strokeSizeBounds.max - 1;
// 	}

// 	// draw patterns
//   drawLineWithSymmetry(position, end);

//   // save cursor position
//   [position.x, position.y] = [end.x, end.y];

//   //requestAnimationFrame(animateCursor);
// }
//setInterval(animateCursor, 10);