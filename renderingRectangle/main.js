var utils = new WebGLUtils();
var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;
var gl = utils.getGlContext(canvas);

// Rendering Rectangle

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
void main() {
    color = vec4(0.0, 0.0, 1.0, 1.0); // r,g,b,a 
}
`;

// Step 2: Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);

// Step 3: Creating buffers
var data = new Float32Array([
  -0.7,
  -0.4,
  0.7,
  0.4,
  -0.7,
  0.4,
  -0.7,
  -0.4,
  0.7,
  0.4,
  0.7,
  -0.4,
]);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

// Step 4: Linking of CPU and GPU
gl.useProgram(program)
var position = utils.linkGPUAndCPU({
  program: program,
  gpuVariable: "position",
  channel: gl.ARRAY_BUFFER,
  buffer: buffer,
  dims: 2,
},gl);

// Step 4: Render the rectangle
gl.drawArrays(gl.TRIANGLES, 0, 6);

// 6 beacause 6 vertices
