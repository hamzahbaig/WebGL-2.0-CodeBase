var utils = new WebGLUtils();
var canvas = document.getElementById("canvas");
canvas.width = 1600;
canvas.height = 800;
var gl = utils.getGlContext(canvas);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// Step 1: Writing Shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
void main() {
    gl_Position = vec4(position.x,position.y, 0.0, 1.0);
    gl_PointSize = 2.0;
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

// Step 3
var circleVertices = utils.getCircleCoordinates(0.0, 0.0, 0.3, 500);
var buffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(circleVertices)
);

var secondMinuteVertices = utils.getCircleCoordinates(0.0, 0.0, 0.27, 60);
var secondMinutebuffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(secondMinuteVertices)
);

var secondLineBuffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(utils.getCircleCoordinates(0.0, 0.0, 0.27, 60, true))
);

var minuteLineBuffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(utils.getCircleCoordinates(0.0, 0.0, 0.22, 60, true))
);

var hourLineBuffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(utils.getCircleCoordinates(0.0, 0.0, 0.14, 60, true))
);

// Step 4
var getLineCoords = (input) => {
  var index = 0;
  var start = 15;
  if (input < start) {
    index = start - input;
  } else {
    index = 60 - input + start;
  }
  return index * 2;
};
setInterval(() => {
  var d = new Date();
  var hours = d.getHours() > 12 ? d.getHours - 12 : d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  gl.useProgram(program);
  utils.linkGPUAndCPU(
    {
      program: program,
      gpuVariable: "position",
      dims: 2,
      buffer: buffer,
    },
    gl
  );

  var inputColor = gl.getUniformLocation(program, "inputColor");
  gl.uniform3fv(inputColor, [1.0, 0.1, 0.5]);

  // Step 5
  gl.drawArrays(gl.POINTS, 0, circleVertices.length / 2);

  utils.linkGPUAndCPU(
    {
      program: program,
      gpuVariable: "position",
      dims: 2,
      buffer: secondMinutebuffer,
    },
    gl
  );
  gl.drawArrays(gl.POINTS, 0, secondMinuteVertices.length / 2);

  utils.linkGPUAndCPU(
    {
      program: program,
      gpuVariable: "position",
      dims: 2,
      buffer: secondLineBuffer,
    },
    gl
  );
  gl.drawArrays(gl.LINES, getLineCoords(seconds), 2);

  utils.linkGPUAndCPU(
    {
      program: program,
      gpuVariable: "position",
      dims: 2,
      buffer: minuteLineBuffer,
    },
    gl
  );
  gl.drawArrays(gl.LINES, getLineCoords(minutes), 2);

  utils.linkGPUAndCPU(
    {
      program: program,
      gpuVariable: "position",
      dims: 2,
      buffer: hourLineBuffer,
    },
    gl
  );
  gl.drawArrays(
    gl.LINES,
    getLineCoords(hours * 5 + Math.floor(minutes / 60)),
    2
  );
}, 1000);
