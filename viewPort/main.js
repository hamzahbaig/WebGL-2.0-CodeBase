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
uniform vec3 randomColor;
void main() {
    color = vec4(randomColor, 1.0); // r,g,b,a 
}
`;

// Step 2: Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);

// Step 3: Creating buffers
var data = new Float32Array(utils.prepareRectVec2(-1.0, -1.0, 1.0, 1.0));
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

// Step 4: Linking of CPU and GPU
gl.useProgram(program);
var position = utils.linkGPUAndCPU(
  {
    program: program,
    gpuVariable: "position",
    buffer: buffer,
    dims: 2,
  },
  gl
);

// Step 5: Render the rectangle
var randomColor = gl.getUniformLocation(program, "randomColor");
gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(0, 0, gl.canvas.width / 2, gl.canvas.height / 2);
gl.drawArrays(gl.TRIANGLES, 0, 6);

gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(gl.canvas.width / 2, 0, gl.canvas.width / 2, gl.canvas.height / 2);
gl.drawArrays(gl.TRIANGLES, 0, 6);

gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(0, gl.canvas.height / 2, gl.canvas.width / 2, gl.canvas.height / 2);
gl.drawArrays(gl.TRIANGLES, 0, 6);

// vview port -> x,y,width,height
gl.uniform3fv(randomColor, [Math.random(), Math.random(), Math.random()]);
gl.viewport(
  gl.canvas.width / 2,
  gl.canvas.height / 2,
  gl.canvas.width / 2,
  gl.canvas.height / 2
);
gl.drawArrays(gl.TRIANGLES, 0, 6);
// 6 beacause 6 vertices
