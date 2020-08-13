var utils = new WebGLUtils();
var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;
var gl = utils.getGlContext(canvas);

// Step 1: Writing Shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
void main() {
    gl_Position = vec4(position.x,position.y, 0.0, 1.0);
    gl_PointSize = 20.0;
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main() {
    color = vec4(1.0, 0.0, 0.0, 1.0); // r,g,b,a 
}
`;

// Step 2: Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);

// Step 3: Creating Buffer
var getCircleCoordinates = () => {
  var centerX = 0.0;
  var centerY = 0.0;
  var radius = 0.4;
  var numOfPoints = 50;
  var circleCoords = [];
  for (var i = 0; i < numOfPoints; i++) {
    var circumference = 2 * Math.PI * (i / numOfPoints);
    var x = centerX + radius * Math.cos(circumference);
    var y = centerY + radius * Math.sin(circumference);
    circleCoords.push(x, y);
  }
  return circleCoords;
};

var vertices = getCircleCoordinates();
var data = new Float32Array(vertices);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

// Step 4: Linking CPU and GPU
gl.useProgram(program);
var position = utils.linkGPUAndCPU(
  {
    program: program,
    dims: 2,
    buffer: buffer,
    gpuVariable: "position",
  },
  gl
);

// Step 5: Drawing Array
gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
