// Setting Up WEBGL 2.0
let utils = new WebGLUtils();
let canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;
let gl = utils.getGlContext(canvas);
gl.clearColor(1.0, 1.0, 1.0, 0.5);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

// Initialize Variable
// Step 1: Writing Shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
void main() {
    gl_Position = vec4(position.x,position.y*-1.0, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main() {
    color = vec4(0.0, 0.0, 1.0, 1.0); // r,g,b,a 
}
`;
var program = utils.getProgram(gl, vertexShader, fragmentShader);

const draw = (coords, drawingMode) => {
  gl.clear(gl.DEPTH_BUFFER_BIT);
  var data = new Float32Array(coords);

  var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);
  gl.useProgram(program);
  utils.linkGPUAndCPU(
    {
      program: program,
      gpuVariable: "position",
      buffer: buffer,
      dims: 2,
    },
    gl
  );
  gl.drawArrays(drawingMode, 0, coords.length / 2);
};

var getDiff = (startX, startY, endX, endY) => {
  var obj = {
    startX: startX,
    startY: startY,
    endX: endX,
    endY,
  };
  var v = utils.getGPUCoords(obj); //-1 to +1
  v = utils.getGPUCoords0To2(v); //0 to 2
  var diffX = v.endX - v.startX;
  var diffY = v.endY - v.startY;
  return {
    x: diffX,
    y: diffY,
  };
};
var currSX = 360,
  currSY = 360,
  currEX = 400,
  currEY = 380;

var lastSX = 360,
  lastSY = 360,
  lastEX = 400,
  lastEY = 380;

var v = utils.getGPUCoords({
  startX: currSX,
  startY: currSY,
  endX: currEX,
  endY: currEY,
});
currSX = v.startX;
currSY = v.startY;
currEX = v.endX;
currEY = v.endY;
lastSX = v.startX;
lastSY = v.startY;
lastEX = v.endX;
lastEY = v.endY;
var vertices = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
draw(vertices, gl.TRIANGLES);

initializeEvents(
  gl,
  (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    currSX += diff.x;
    currSY += diff.y;
    currEX += diff.x;
    currEY += diff.y;

    let vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
    draw(vertices, gl.TRIANGLES);
    currSX = lastSX;
    currSY = lastSY;
    currEX = lastEX;
    currEY = lastEY;
  },
  (startX, startY, endX, endY) => {
    console.log("MOUSE Up");
    // console.log(startX, startY, endX, endY);
    var diff = getDiff(startX, startY, endX, endY);
    lastSX += diff.x;
    lastSY += diff.y;
    lastEX += diff.x;
    lastEY += diff.y;
    currSX = lastSX;
    currSY = lastSY;
    currEX = lastEX;
    currEY = lastEY;
  },
  (deltaY) => {
    if (deltaY > 0) {
      //zoom out
      currSX -= currSX * 0.1;
      currEX -= currEX * 0.1;
      currSY -= currSY * 0.1;
      currEY -= currEY * 0.1;
    } else {
      //zoom in
      currSX += currSX * 0.1;
      currEX += currEX * 0.1;
      currSY += currSY * 0.1;
      currEY += currEY * 0.1;
    }
    vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
    draw(vertices, gl.TRIANGLES);
    lastSX = currSX;
    lastSY = currSY;
    lastEX = currEX;
    lastEY = currEY;
  }
);
