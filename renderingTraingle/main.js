var util = new WebGLUtils();

var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;
var gl = util.getGlContext(canvas);

// Rendering Triangle
var triangleCoords = [0.0, -1.0, 0.0, 1.0, 1.0, -1.0];

// Step 1: Write Shaders (Sending input from CPU to GPU)
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
void main() {
    gl_Position = vec4(position.x,position.y, 0.0, 1.0);
}`;
var fragmentShdaer = `#version 300 es
precision mediump float;
out vec4 color;
void main() {
    color = vec4(0.0, 0.0, 1.0, 1.0); // r,g,b,a 
}
`;

// Step 2: Create Program from shaders
var program = util.getProgram(gl, vertexShader, fragmentShdaer);
console.log("HAMZAH")
// Step 3: Create Buffers
var buffer = util.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(triangleCoords)
);

// Step 4: Link GPU variable to CPU and sending data
gl.useProgram(program);
var position = util.linkGPUAndCPU({
  program: program,
  gpuVariable: "position",
  channel: gl.ARRAY_BUFFER,
  buffer: buffer,
  dims: 2,
},gl);

// Step 5: Render Triangle
gl.drawArrays(gl.TRIANGLES, 0, 4);
