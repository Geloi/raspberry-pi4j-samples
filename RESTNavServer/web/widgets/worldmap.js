/**
 *
 * @author Olivier Le Diouris
 */

const projections = [ "ANAXIMANDRE", "MERCATOR", "GLOBE" ];

var clear = function(canvasName) {
  var canvas = document.getElementById(canvasName);
  if (canvas !== undefined) {
      var context = canvas.getContext('2d');
      // Cleanup
      context.fillStyle = "rgba(0, 0, 100, 10.0)";
      context.fillRect(0, 0, canvas.width, canvas.height);
  }
};

var fromPt, toPt;
var animationID;

var addCanvasListener = function(canvasName) {
  var canvas = document.getElementById(canvasName);
  canvas.addEventListener("click", // "click", "dblclick", "mousedown", "mouseup", "mousemove"
                          function(event) {
//                          console.log("Click on Canvas, event=" + (event == undefined?"undefined":("OK:" + event.clientX + ", " + event.clientY)));
                            var xClick;
                            var yClick;
                            
                            if (event.pageX || event.pageY) {
                              xClick = event.pageX;
                              yClick = event.pageY;
                            } else {
                              xClick = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
                              yClick = event.clientY + document.body.scrollTop  + document.documentElement.scrollTop; 
                            } 
                            xClick -= canvas.offsetLeft;
                            yClick -= canvas.offsetTop;

                            if (toPt !== undefined) {
                              fromPt = toPt; // Swap
                              toPt = undefined;
                              clear(canvasName);
                              drawWorldMap(canvasName);
                              plotPoint(canvasName, fromPt, "red");
                            }
                            if (fromPt === undefined) {
                              fromPt = { "x":xClick, "y":yClick };
                              plotPoint(canvasName, fromPt, "red");
                            } else if (toPt === undefined) {
                              toPt = { "x":xClick, "y":yClick };
                              plotPoint(canvasName, toPt, "red");
                              currentStep = 0;
                              animationID = window.setInterval(function() { travel(canvasName, fromPt, toPt, 10); }, 100);
                            }
                          }, false);
};

var plotPoint = function(canvasName, pt, color) {
  var canvas = document.getElementById(canvasName);
  var context = canvas.getContext('2d');
  context.beginPath();
  context.fillStyle = color;
  context.arc(pt.x, pt.y, 2, 0, 2*Math.PI);
  context.stroke();
  context.fill();
};

var currentStep = 0;
var travel = function(canvasName, from, to, nbStep) {
  var newX = from.x + (currentStep * (to.x - from.x) / nbStep);
  var newY = from.y + (currentStep * (to.y - from.y) / nbStep);
  plotPoint(canvasName, {"x":newX, "y":newY}, "gray");
  currentStep++;
  if (currentStep > nbStep) {
    window.clearInterval(animationID);
  }
};

var globeViewRightLeftRotation = -23;
var globeViewForeAftRotation = 30;

var globeViewLngOffset = -122; // Observer's longitude?

/**
 * Used to draw a globe
 * alpha, then beta
 *
 * @param lat in radians
 * @param lng in radians
 * @return x, y, z. Cartesian coordinates.
 */
var rotateBothWays = function(lat, lng) {
	var x = Math.cos(lat) * Math.sin(lng);
	var y = Math.sin(lat);
	var z = Math.cos(lat) * Math.cos(lng);

	var alfa = toRadians(globeViewRightLeftRotation); // in plan (x, y), z unchanged, earth inclination on its axis
	var beta = toRadians(globeViewForeAftRotation);   // in plan (y, z), x unchanged, latitude of the eye
	/*
	 *                      |  cos a -sin a  0 |  a > 0 : counter-clockwise
	 * Rotation plan x, y:  |  sin a  cos a  0 |
	 *                      |    0     0     1 |
	 *
	 *                      | 1    0      0    |  b > 0 : towards user
	 * Rotation plan y, z:  | 0  cos b  -sin b |
	 *                      | 0  sin b   cos b |
	 *
	 *  | x |   | cos a -sin a  0 |   | 1   0      0    |   | x |   |  cos a  (-sin a * cos b) (sin a * sin b) |
	 *  | y | * | sin a  cos a  0 | * | 0  cos b -sin b | = | y | * |  sin a  (cos a * cos b) (-cos a * sin b) |
	 *  | z |   |  0      0     1 |   | 0  sin b  cos b |   | z |   |   0          sin b           cos b       |
	 */

	// All in once
	var _x = (x * Math.cos(alfa)) - (y * Math.sin(alfa) * Math.cos(beta)) + (z * Math.sin(alfa) * Math.sin(beta));
	var _y = (x * Math.sin(alfa)) + (y * Math.cos(alfa) * Math.cos(beta)) - (z * Math.cos(alfa) * Math.sin(beta));
	var _z =                        (y * Math.sin(beta))                  + (z * Math.cos(beta));

	return { x: _x, y: _y, z: _z };
};

var _west = -180,
		_east = 180,
		_north = 90,
		_south = -90;

var isTransparentGlobe = function() {
	return true; // Hard-coded for now
};

/**
 *
 * @param lat in radians
 * @param lng in radians
 * @returns {boolean}
 */
var isBehind = function(lat, lng) {
	var rotated = rotateBothWays(lat, lng);
	return (rotated.z < 0.0);
};

var adjustBoundaries = function() {
	// _north = north;
	// _south = south;
	// _east = east;
	// _west = west;
	if (sign(_east) != sign(_west) && sign(_east) == -1)
		_west = _west - 360;
};

var sign = function(d) {
	var s = 0;
	if (d > 0.0) {
		s = 1;
	}
	if (d < 0.0) {
		s = -1;
	}
	return s;
};

/**
 *
 * @param lat in degrees
 * @param lng in degrees
 */
var getPanelPoint = function(lat, lng) {
	var pt = {};
	adjustBoundaries();
	if (_north != _south && _east != _west) {
		for (var gAmpl = _east - _west; gAmpl < 0; gAmpl += 360);
		var graph2chartRatio = w / gAmpl;
		var _lng = lng;
		if (Math.abs(_west) > 180 && sign(_lng) != sign(_west) && sign(_lng) > 0) {
			_lng -= 360;
		}
		if (gAmpl > 180 && _lng < 0 && _west > 0) {
			_lng += 360;
		}
		if (gAmpl > 180 && _lng >= 0 && _west > 0 && _lng < _east) {
			_lng += (_west + (gAmpl - _east));
		}
		var rotated = rotateBothWays(toRadians(lat), toRadians(_lng - globeViewLngOffset));
		var x = Math.round(globeView_ratio * rotated.x);
		x += globeViewOffset_X;
		var y = Math.round(globeView_ratio * rotated.y);
		y = globeViewOffset_Y - y;
		pt = {x: x, y: y};
	}
	return pt;
}

var vGrid = 5,
    hGrid = 5;
var w, h;

var drawGlobe = function (canvas, context) {
	var minX = Number.MAX_VALUE;
	var maxX = -Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	var maxY = -Number.MAX_VALUE;

	w = canvas.width;
	h = canvas.height;

	var gOrig = Math.ceil(_west);
	var gProgress = gOrig;

	if (gProgress % vGrid !== 0) {
		gProgress = ((gProgress / vGrid) + 1) * vGrid;
	}
	var go = true;

	var __south = -90;
	var __north =  90;

	while (go) {
		for (var _lat = __south; _lat <= __north; _lat += 5) {
			var rotated = rotateBothWays(toRadians(_lat), toRadians(gProgress));

			var dx = rotated.x;
			var dy = rotated.y;
//    console.log("dx:" + dx + ", dy:" + dy);
			if (dx < minX) minX = dx;
			if (dx > maxX) maxX = dx;
			if (dy < minY) minY = dy;
			if (dy > maxY) maxY = dy;
		}
		gProgress += vGrid;
		if (gProgress > _east) {
			go = false;
		}
	}

	gOrig = Math.ceil(__south);
	var lProgress = gOrig;
	if (lProgress % hGrid !== 0) {
		lProgress = ((lProgress / hGrid) + 1) * hGrid;
	}
	go = true;
	while (go) {
		var rotated = rotateBothWays(toRadians(lProgress), toRadians(_west));
		var dx = rotated.x;
		var dy = rotated.y;
//  console.log("dx:" + dx + ", dy:" + dy);
		minX = Math.min(minX, dx);
		maxX = Math.max(maxX, dx);
		minY = Math.min(minY, dy);
		maxY = Math.max(maxY, dy);
		rotated = rotateBothWays(toRadians(lProgress), toRadians(_east));
		dx = rotated.x;
		dy = rotated.y;
//  console.log("dx:" + dx + ", dy:" + dy);
		minX = Math.min(minX, dx);
		maxX = Math.max(maxX, dx);
		minY = Math.min(minY, dy);
		maxY = Math.max(maxY, dy);
		lProgress += hGrid;

//	console.log("MinX, MaxX, MinY, MaxY ", minX, maxX, minY, maxY);
		if (lProgress > __north) {
			go = false;
		}
	}
//console.log("MinX:" + minX + ", MaxX:" + maxX + ", MinY:" + minY + ", MaxY:" + maxY);
	var opWidth = Math.abs(maxX - minX);
	var opHeight = Math.abs(maxY - minY);
	globeView_ratio = Math.min(w / opWidth, h / opHeight);

	globeViewOffset_X = Math.abs((globeView_ratio * opWidth) - w) / 2 - (globeView_ratio * minX);
	globeViewOffset_Y = Math.abs((globeView_ratio * opHeight) - h) / 2 - (globeView_ratio * minY);

	var gstep = 10; //Math.abs(_east - _west) / 60;
	var lstep = 10;  //Math.abs(_north - _south) / 10;

	context.lineWidth = 1;
	context.strokeStyle = 'rgba(0, 255, 255, 0.3)'; // 'cyan';

	var top = 0, bottom = h, left = h, right = 0;
	// Meridians
	for (var i = Math.min(_east, _west); i < Math.max(_east, _west); i += gstep) {
		var previous = null;
		context.beginPath();
		for (var j = Math.min(_south, _north) + (lstep / 5); j < Math.max(_south, _north); j += (lstep / 5)) {
			var p = getPanelPoint(j, i);

			top = Math.max(p.y, top);
			bottom = Math.min(p.y, bottom);
			right = Math.max(p.x, right);
			left = Math.min(p.x, left);

			var thisPointIsBehind = isBehind(j, i - globeViewLngOffset);

			if (!isTransparentGlobe() && thisPointIsBehind) {
//			context.stroke();
				previous = null;
			} else {
				if (previous !== null) {
					if (Math.abs(previous.x - p.x) < (canvas.width / 2) && Math.abs(previous.y - p.y) < (canvas.height / 2)) {
						context.lineTo(p.x, p.y);
					}
				} else {
					context.moveTo(p.x, p.y);
				}

//			  context.beginPath();
// 				context.fillStyle = 'red';
// 				context.arc(p.x, p.y, 2, 0, 2*Math.PI);
// 				context.stroke();
// 				context.fill();

				previous = p;
			}
		}
		context.stroke();
		context.closePath();
	}

//console.log("top, bottom, left, right ", top, bottom, left, right);

	// Parallels
	for (var j = Math.min(_south, _north) + lstep; j < Math.max(_south, _north); j += lstep) {
		var previous = null;
		context.beginPath();
		for (var i = Math.min(_east, _west); i <= Math.max(_east, _west); i += gstep) {
			var p = getPanelPoint(j, i);
			var thisPointIsBehind = isBehind(j, i - globeViewLngOffset);

			if (!isTransparentGlobe() && thisPointIsBehind) {
				context.stroke();
				previous = null;
			} else {
				if (previous !== null) {
					if (Math.abs(previous.x - p.x) < (canvas.width / 2) && Math.abs(previous.y - p.y) < (canvas.height / 2)) {
						context.lineTo(p.x, p.y);
					}
				} else {
					context.moveTo(p.x, p.y);
				}
				previous = p;
			}
		}
		context.closePath();
		context.stroke();
	}

	// Chart
	if (fullWorldMap === undefined) {
		console.log("You must load [WorldMapData.js] to display a chart.");
	} else {
		try {
			var worldTop = fullWorldMap.top;
			var section = worldTop.section; // We assume top has been found.

	    console.log("Found " + section.length + " section(s).")
			for (var i = 0; i < section.length; i++) {
				var point = section[i].point;
				if (point !== undefined) {
					var firstPt = null;
					var previousPt = null;
					context.beginPath();
					for (var p = 0; p < point.length; p++) {
						var lat = parseFloat(point[p].Lat);
						var lng = parseFloat(point[p].Lng);
						if (lng < -180) lng += 360;
						if (lng > 180) lng -= 360;
						var pt = getPanelPoint(lat, lng);
						if (p === 0) {
							context.moveTo(pt.x, pt.y);
							firstPt = pt;
							previousPt = pt;
						} else {
							if (Math.abs(previousPt.x - pt.x) < (canvas.width / 2) && Math.abs(previousPt.y - pt.y) < (canvas.height / 2)) {
								context.lineTo(pt.x, pt.y);
								previousPt = pt;
							}
						}
					}
				}
				if (firstPt !== null) {
					context.lineTo(firstPt.x, firstPt.y); // close the loop
				}
				context.lineWidth = 1;
				context.strokeStyle = 'cyan';
				context.stroke();
				context.closePath();
			}
		} catch (ex) {
			console.log("Oops:" + ex);
		}
	}
};

var drawAnaximandreChart = function(canvas, context) {
	// Square projection, Anaximandre.
	var worldTop = fullWorldMap.top;
	var section = worldTop.section; // We assume top has been found.

//    console.log("Found " + section.length + " section(s).")
	for (var i = 0; i < section.length; i++) {
		var point = section[i].point;
		if (point !== undefined) {
			var firstPt = null;
			var previousPt = null;
			context.beginPath();
			for (var p = 0; p < point.length; p++) {
				var lat = parseFloat(point[p].Lat);
				var lng = parseFloat(point[p].Lng);
				if (lng < -180) lng += 360;
				if (lng > 180) lng -= 360;
				var pt = posToCanvas(canvas, lat, lng);
				if (p === 0) {
					context.moveTo(pt.x, pt.y);
					firstPt = pt;
					previousPt = pt;
				} else {
					if (Math.abs(previousPt.x - pt.x) < (canvas.width / 2) && Math.abs(previousPt.y - pt.y) < (canvas.height / 2)) {
						context.lineTo(pt.x, pt.y);
						previousPt = pt;
					}
				}
			}
		}
		if (firstPt !== null) {
			context.lineTo(firstPt.x, firstPt.y); // close the loop
		}
		context.lineWidth = 1;
		context.strokeStyle = 'black';
		context.stroke();
		context.fillStyle = "goldenrod";
		context.fill();
		context.closePath();
	}
};

var drawWorldMap = function(canvasName, proj) {
//var start = new Date().getTime();
  
  var canvas = document.getElementById(canvasName);
  var context = canvas.getContext('2d');

  if (fullWorldMap === undefined) {
    console.log("You must load [WorldMapData.js] to display a chart.");
  } else {
	  try {
	  	switch (proj) {
			  case undefined:
			  case "ANAXIMANDRE":
				  drawAnaximandreChart(canvas, context);
			  	break;
			  case "GLOBE":
				  drawGlobe(canvas, context);
			  	break;
			  default:
			  	console.log("Projection %s not available yet", proj);
			  	break;
		  }
	  } catch (ex) {
		  console.log("Oops:" + ex);
	  }
  }
//var end = new Date().getTime();
//console.log("Operation completed in " + (end - start) + " ms.");
};

var plotPosToCanvas = function(canvasName, lat, lng, label, color) {
  var canvas = document.getElementById(canvasName); 
  var pt = posToCanvas(canvas, lat, lng);
  plotPoint(canvasName, pt, (color !== undefined ? color : "red"));
  if (label !== undefined) {
    try {
      var context = canvas.getContext('2d');
      context.fillStyle = (color !== undefined ? color : "red");
      context.fillText(label, Math.round(pt.x) + 3, Math.round(pt.y) - 3);
    } catch (err) { // Firefox has some glitches here
      if (console.log !== undefined) {
        if (err.message !== undefined && err.name !== undefined) {
          console.log(err.message + " " + err.name);
        } else {
          console.log(err);
        }
      }
    }
  }
};

var posToCanvas = function(canvas, lat, lng) { // Anaximandre
  var x = (180 + lng) * (canvas.width / 360);
  var y = canvas.height - ((lat + 90) * canvas.height / 180);
  
  return { "x":x, "y":y };
};

var toRadians = function (deg) {
	return deg * (Math.PI / 180);
};

var toDegrees = function (rad) {
	return rad * (180 / Math.PI);
};
