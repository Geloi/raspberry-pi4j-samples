const verbose = true;

const pluviometerColorConfigWhite = {
	withShadow: true,
	shadowColor: 'LightGrey',
	scaleColor: 'black',
	bgColor: 'white',
	majorTickColor: 'LightGrey',
	minorTickColor: 'DarkGrey',
	valueOutlineColor: 'black',
	valueColor: 'DarkGrey',
	tubeOutlineColor: 'pink',
	hgOutlineColor: 'DarkGrey',
	font: 'Arial'
};

const pluviometerColorConfigBlack = {
	withShadow: true,
	shadowColor: 'black',
	scaleColor: 'LightGrey',
	bgColor: 'black',
	majorTickColor: 'LightGrey',
	minorTickColor: 'DarkGrey',
	valueOutlineColor: 'black',
	valueColor: 'LightGrey',
	tubeOutlineColor: 'pink',
	hgOutlineColor: 'DarkGrey',
	font: 'Arial'
};

let pluviometerColorConfig = pluviometerColorConfigWhite; // White is the default

/* global HTMLElement */

class Pluviometer extends HTMLElement {

	static get observedAttributes() {
		return [
			"width",
			"height",
			"min-value",
			"max-value",
			"major-ticks",
			"minor-ticks",
			"value"
		];
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({mode: 'open'}); // 'open' means it is accessible from external JavaScript.
		this.canvas = document.createElement("canvas"); // create and append a <canvas>
		this.shadowRoot.appendChild(this.canvas);

		this._value = 0; // Init
		this._width = 50;
		this._height = 150;
		this._min_value = 0;
		this._max_value = 10;
		this._major_ticks = 1;
		this._minor_ticks = 0.25;
		if (verbose) {
			console.log("Data in Constructor:", this._value);
		}
	}

	connectedCallback() { // Called whenever the custom element is inserted into the DOM.
		if (verbose) {
			console.log("connectedCallback invoked, 'value' value is [", this.value, "]");
		}
	}

	disconnectedCallback() { // Called whenever the custom element is removed from the DOM.
		if (verbose) {
			console.log("disconnectedCallback invoked");
		}
	}

	attributeChangedCallback(attrName, oldVal, newVal) { // Called whenever an attribute is added, removed or updated. Only attributes listed in the observedAttributes property are affected.
		if (verbose) {
			console.log("attributeChangedCallback invoked on " + attrName + " from " + oldVal + " to " + newVal);
		}
		switch (attrName) {
			case "value":
				this._value = parseFloat(newVal);
				break;
			case "width":
				this._width = parseInt(newVal);
				break;
			case "height":
				this._height = parseInt(newVal);
				break;
			case "min-value":
				this._min_value = parseFloat(newVal);
				break;
			case "max-value":
				this._max_value = parseFloat(newVal);
				break;
			case "major-ticks":
				this._major_ticks = parseFloat(newVal);
				break;
			case "minor-ticks":
				this._minor_ticks = parseFloat(newVal);
				break;
			default:
				break;
		}
		this.paint();
	}

	adoptedCallback() { // Called whenever the custom element has been moved into a new document.
		if (verbose) {
			console.log("adoptedCallback invoked");
		}
	}

	// Set the "data" property
	set value(option) {
		this.setAttribute("value", option);
		if (verbose) {
			console.log(">> Value option:", option);
		}
		this.paint();
	}
	set width(val) {
		this.setAttribute("width", val);
	}
	set height(val) {
		this.setAttribute("height", val);
	}
	set minValue(val) {
		this.setAttribute("min-value", val);
	}
	set maxValue(val) {
		this.setAttribute("max-value", val);
	}
	set majorTicks(val) {
		this.setAttribute("major-ticks", val);
	}
	set minorTicks(val) {
		this.setAttribute("minor-ticks", val);
	}

	set shadowRoot(val) {
		this._shadowRoot = val;
	}

	// Get the "open" property
	get value() {
		return this._value;
	}
	get width() {
		return this._width;
	}
	get height() {
		return this._height;
	}
	get minValue() {
		return this._min_value;
	}
	get maxValue() {
		return this._max_value;
	}
	get minorTicks() {
		return this._minor_ticks;
	}
	get majorTicks() {
		return this._major_ticks;
	}

	get shadowRoot() {
		return this._shadowRoot;
	}

	// Component methods
	paint() {

		let digitColor = pluviometerColorConfig.scaleColor;
		let context = this.canvas.getContext('2d');

		if (this.width === 0 || this.height === 0) { // Not visible
			return;
		}
		// Set the canvas size from its container.
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		// Cleanup
		context.fillStyle = pluviometerColorConfig.bgColor;
		//context.fillStyle = "#ffffff";
		//context.fillStyle = "LightBlue";
		//context.fillStyle = "transparent";
		context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		//context.fillStyle = 'rgba(255, 255, 255, 0.0)';
		//context.fillRect(0, 0, canvas.width, canvas.height);

		//context.fillStyle = "transparent";
		// Bottom of the tube at (canvas.height - 10)
		let bottomTube = (this.canvas.height - 10);
		let topTube = 20;// Top of the tube at y = 20

		let tubeLength = bottomTube - topTube;
		let tubeWidth = tubeLength / 5;
		let xFrom, xTo, yFrom, yTo;

		// Tube
		context.beginPath();
		//context.arc(x, y, radius, startAngle, startAngle + Math.PI, antiClockwise);
		let x = (this.canvas.width / 2) - (1.5 * (tubeWidth / 2));
		let y = bottomTube;
		context.moveTo(x, y);    // bottom left
		x = (this.canvas.width / 2) + (1.5 * (tubeWidth / 2));
		context.lineTo(x, y); // bottom right
		x = (this.canvas.width / 2) + (tubeWidth / 2);
		y = bottomTube - 5;
		context.lineTo(x, y); // Right, just above the foot
		y = topTube;
		context.lineTo(x, y); // Top right
		x = (this.canvas.width / 2) - (1.5 * (tubeWidth / 2));
		context.lineTo(x, y); // Top left, with the bill
		y = topTube + 10;
		x = (this.canvas.width / 2) - (tubeWidth / 2);
		context.lineTo(x, y); // Left, under the bill
		y = bottomTube - 5;
		context.lineTo(x, y); // Left, just above the foot
		x = (this.canvas.width / 2) - (1.5 * (tubeWidth / 2));
		y = bottomTube;
		context.lineTo(x, y); // Back to base

		context.lineWidth = 1;
		context.stroke();

		let grd = context.createLinearGradient(0, 5, 0, tubeLength);
		grd.addColorStop(0, 'LightGrey'); // 0  Beginning. black
		grd.addColorStop(1, 'white');     // 1  End. LightGrey
		context.fillStyle = grd;

		if (pluviometerColorConfig.withShadow) {
			context.shadowOffsetX = 3;
			context.shadowOffsetY = 3;
			context.shadowBlur = 3;
			context.shadowColor = pluviometerColorConfig.shadowColor;
		}

		context.lineJoin = "round";
		context.fill();
		context.strokeStyle = pluviometerColorConfig.tubeOutlineColor; // Tube outline color
		context.stroke();
		context.closePath();

		bottomTube -= 5;
		topTube -= 5;
		tubeLength -= 10;

		// Liquid in the tube
		context.beginPath();
		x = (this.canvas.width / 2) - (0.9 * (tubeWidth / 2));
		y = bottomTube;
		context.moveTo(x, y);   // bottom left
		x = (this.canvas.width / 2) + (0.9 * (tubeWidth / 2));
		context.lineTo(x, y);   // bottom right
		y = bottomTube - ((tubeLength) * (this.value / (this.maxValue - this.minValue)));
		context.lineTo(x, y);   // top right
		x = (this.canvas.width / 2) - (0.9 * (tubeWidth / 2));
		context.lineTo(x, y);   // top left

		context.lineWidth = 1;

		let _grd = context.createLinearGradient(0, topTube, 0, tubeLength);
		// Colors are hard-coded...
		_grd.addColorStop(0, 'navy');   // 0  Beginning, top
		_grd.addColorStop(0.5, 'blue');
		_grd.addColorStop(1, 'cyan');   // 1  End, bottom
		context.fillStyle = _grd;

//  context.shadowBlur  = 20;
//  context.shadowColor = 'black';

		context.lineJoin = "round";
		context.fill();
		context.strokeStyle = pluviometerColorConfig.hgOutlineColor;
		context.stroke();
		context.closePath();

		// Major Ticks
		context.beginPath();
		for (let i = 0; i <= (this.maxValue - this.minValue); i += this.majorTicks) {
			xFrom = (this.canvas.width / 2) + (tubeWidth / 2);
			yFrom = bottomTube - ((tubeLength) * (i / (this.maxValue - this.minValue)));
			xTo = xFrom - 20;
			yTo = yFrom;
			context.moveTo(xFrom, yFrom);
			context.lineTo(xTo, yTo);
		}
		context.lineWidth = 1;
		context.strokeStyle = pluviometerColorConfig.majorTickColor;
		context.stroke();
		context.closePath();

		// Minor Ticks
		if (this.minorTicks > 0) {
			context.beginPath();
			for (let i = 0; i <= (this.maxValue - this.minValue); i += this.minorTicks) {
				xFrom = (this.canvas.width / 2) + (tubeWidth / 2);
				yFrom = bottomTube - ((tubeLength) * (i / (this.maxValue - this.minValue)));
				xTo = xFrom - 10;
				yTo = yFrom;
				context.moveTo(xFrom, yFrom);
				context.lineTo(xTo, yTo);
			}
			context.lineWidth = 1;
			context.strokeStyle = pluviometerColorConfig.minorTickColor;
			context.stroke();
			context.closePath();
		}

		// Numbers
		context.beginPath();
		for (let i = this.minValue; i <= this.maxValue; i += this.majorTicks) {
			xTo = (this.canvas.width / 2) + 20;
			yTo = bottomTube - ((tubeLength) * ((i - this.minValue) / (this.maxValue - this.minValue)));

			context.font = "bold 10px " + pluviometerColorConfig.font;
			context.fillStyle = digitColor;
			let str = i.toString();
			let len = context.measureText(str).width;
			context.fillText(str, xTo, yTo + 3); // 5: half font size
		}
		context.closePath();

		// Value
//  this.value = 5.3; // for tests
		let text = this.value.toFixed(2);
		let len = 0;
		context.font = "bold 12px " + pluviometerColorConfig.font;
		let metrics = context.measureText(text);
		len = metrics.width;

		context.beginPath();
		context.fillStyle = pluviometerColorConfig.valueColor;
		context.fillText(text, (this.canvas.width / 2) - (len / 2), 10);
		context.lineWidth = 1;
		context.strokeStyle = pluviometerColorConfig.valueOutlineColor;
		context.strokeText(text, (this.canvas.width / 2) - (len / 2), 10); // Outlined
		context.closePath();
	}
}

/* Note:
To enable custom elements and shadow DOM in Firefox, set the
dom.webcomponents.enabled ,
dom.webcomponents.shadowdom.enabled,
and dom.webcomponents.customelements.enabled preferences to true.
Support will be introduced in Firefox 59/60.

To do it, enter in the firefox url field: about:config

Even like that, Firefox 58 sometimes does not work well (as expected)...
FF 59 to be released on 2018-03-13 (https://wiki.mozilla.org/RapidRelease/Calendar)
 */

// Associate the tag and the class
window.customElements.define('pluvio-meter', Pluviometer);

/*
Could also be used like this:

window.customElements.define('basic-canvas', class extends HTMLElement {
  // Define behaviour here
});

 */
