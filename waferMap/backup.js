// Start of Code
let utils = new WebGLUtils();
let canvas = document.getElementById("canvas");
canvas.width = 1000;
canvas.height = 900;
let gl = utils.getGlContext(canvas);
gl.clearColor(1.0, 1.0, 1.0, 0.5);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

// Initialize Variable
let reticleMask = [];
let devices = [];

let centerOfEclipse1 = 135;
let centerOfEclipse2 = 250;
let widthOfEclipse = 6;
let heightOfEclipse = 12;
let width = 64;
let height = 32;

let waferMaptTestData = utils.randomWaferDataWithBinNum(
  centerOfEclipse1,
  centerOfEclipse2,
  widthOfEclipse,
  heightOfEclipse,
  [1, 2, 3, 4, 5, 6, 7, 8, 9]
);
console.log(waferMaptTestData.length);
let updateCoords = (x, y, offsetY) => {
  let startX = x,
    startY = y + offsetY;
  let obj = {
    startX,
    startY,
    endX: startX + width,
    endY: startY + height,
  };
  let v = utils.getGPUCoords(obj);
  let reticleCoords = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
  reticleMask.push(...reticleCoords);
};
let dontChangeX = waferMaptTestData[0].x;
let dontChangeY = waferMaptTestData[0].y;
let offsetX = 0,
  offsetY = 0;
for (let i = 0; i < waferMaptTestData.length; i++) {
  if (
    waferMaptTestData[i].x == dontChangeX &&
    waferMaptTestData[i].y >= dontChangeY
  ) {
    updateCoords(
      waferMaptTestData[i].x + offsetX,
      waferMaptTestData[i].y,
      offsetY
    );
    offsetY += height;
  } else if (
    waferMaptTestData[i].x != dontChangeX &&
    waferMaptTestData[i].y < dontChangeY
  ) {
    dontChangeX = waferMaptTestData[i].x;
    offsetY = (waferMaptTestData[i].y - dontChangeY) * height;
    offsetX += width;
    updateCoords(
      waferMaptTestData[i].x + offsetX,
      waferMaptTestData[i].y,
      offsetY
    );
    offsetY += height;
  } else if (
    waferMaptTestData[i].x == dontChangeX &&
    waferMaptTestData[i].y < dontChangeY
  ) {
    updateCoords(
      waferMaptTestData[i].x + offsetX,
      waferMaptTestData[i].y,
      offsetY
    );
    offsetY += height;
  } else if (
    waferMaptTestData[i].x != dontChangeX &&
    waferMaptTestData[i].y >= dontChangeY
  ) {
    dontChangeX = waferMaptTestData[i].x;
    offsetY = 0;
    offsetX += width;
    updateCoords(
      waferMaptTestData[i].x + offsetX,
      waferMaptTestData[i].y,
      offsetY
    );
    offsetY += height;
  }
}


let gridOuterLines = [
  { startX: 0, startY: 0, endX: 0, endY: canvas.height },
  { startX: 0, startY: canvas.height, endX: canvas.width, endY: canvas.height },
  { startX: canvas.width, startY: canvas.height, endX: canvas.width, endY: 0 },
  { startX: canvas.width, startY: 0, endX: 0, endY: 0 },
];

// Step 1: Writing Shaders
let vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
void main() {
    gl_Position = vec4(position.x,position.y, 0.0, 1.0);
}`;
let fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec4 reticleColor;
void main() {
    color = reticleColor; // r,g,b,a 
}
`;

// Step 2: Creating Program
let program = utils.getProgram(gl, vertexShader, fragmentShader);

let drawShape = (coords, color, drawingMode) => {
  // Step 3
  let data = new Float32Array(coords);
  let buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

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
  let reticleColor = gl.getUniformLocation(program, "reticleColor");
  gl.uniform4fv(reticleColor, color);

  // Step 5
  gl.drawArrays(drawingMode, 0, coords.length / 2);
};

// console.log(reticleMask);
// reticle Drawing
drawShape(reticleMask, [1.0, 0.0, 0.0, 1.0], gl.TRIANGLES);

// gridOuter Drawing
for (let i = 0; i < gridOuterLines.length; i++) {
  let v = utils.getGPUCoords(gridOuterLines[i]);
  let lineCoords = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
  drawShape(lineCoords, [0.0, 0.0, 0.0, 1.0], gl.LINES);
}
