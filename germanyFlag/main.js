var utils = new WebGLUtils();
var canvas = document.getElementById("canvas");
canvas.width = 1600;
canvas.height = 800;
var gl = utils.getGlContext(canvas);

// Step 1: Writing Shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
void main() {
    gl_Position = vec4(position.x,position.y, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec3 inputColor;
void main() {
    color = vec4(inputColor,1.0); // r,g,b,a 
}
`;

// Step 2: Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);

// Step 3: Creating Buffer
var drawShape = (coords, color, drawingMode) => {
  // Step 3
  var data = new Float32Array(coords);
  var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

  // Step 4
  gl.useProgram(program);
  utils.linkGPUAndCPU(
    {
      program: program,
      buffer: buffer,
      dims: 2,
      gpuVariable: "position",
    },
    gl
  );
  var inputColor = gl.getUniformLocation(program, "inputColor");
  gl.uniform3fv(inputColor, color);

  // Step 5
  gl.drawArrays(drawingMode, 0, coords.length / 2);
};

var yellowColor = [1.0, 1.0, 0.0];
var blackColor = [0.0, 0.0, 0.0];
var redColor = [1.0, 0.0, 0.0];

var lineCoords = [-0.3, 0.7, -0.3, -0.9];
var lineColor = [0.0, 0.0, 0.0];

var blackRectCoords = [
  -0.3,
  0.7,
  -0.3,
  0.4,
  0.4,
  0.7,
  -0.3,
  0.4,
  0.4,
  0.7,
  0.4,
  0.4,
];
var blackRectColor = blackColor;

var redRectCoords = [
  -0.3,
  0.4,
  -0.3,
  0.1,
  0.4,
  0.4,
  -0.3,
  0.1,
  0.4,
  0.4,
  0.4,
  0.1,
];
var redRectColor = redColor;

var yellowRectCoords = [
  -0.3,
  0.1,
  0.4,
  0.1,
  -0.3,
  -0.2,
  0.4,
  0.1,
  -0.3,
  -0.2,
  0.4,
  -0.2,
];
var yellowRectColor = yellowColor;
drawShape(lineCoords, lineColor, gl.LINES);
drawShape(blackRectCoords, blackRectColor, gl.TRIANGLES);
drawShape(redRectCoords, redRectColor, gl.TRIANGLES);
drawShape(yellowRectCoords, yellowRectColor, gl.TRIANGLES);
