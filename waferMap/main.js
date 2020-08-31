"use strict";
// Setting Up WEBGL 2.0
let utils = new WebGLUtils();
let canvas = document.getElementById("canvas");
canvas.width = 900;
canvas.height = 900;
let gl = utils.getGlContext(canvas);
gl.clearColor(1.0, 1.0, 1.0, 0.5);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

// Initialize Variable
let reticleMask = [];
let canvasUpdatedCoord = [];
let devices = [];
let zoomRatio = 0.1;

let centerOfEclipse1 = 100;
let centerOfEclipse2 = 250;
let widthOfEclipse = 400;
let heightOfEclipse =800;
let dieWidth = 64;
let dieHeight = 32;
let dieColor = [1.0, 0.0, 0.0, 0.5];

// Generating Wafer Map Test Data..
let waferMaptTestData = utils.randomWaferDataWithBinNum(
  centerOfEclipse1,
  centerOfEclipse2,
  widthOfEclipse,
  heightOfEclipse,
  [1, 2, 3, 4, 5, 6, 7, 8, 9]
);
console.log(waferMaptTestData.length);

// Step 1: Writing Shaders
let vertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
uniform vec2 a_position;
uniform mat3 u_matrix;
void main() {
    gl_Position = vec4(position.x,position.y*-1.0, 0.0, 1.0);
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

// --------------- HELPER FUNCTIONS ---------------------------
// This function is used to draw any shape provided coordinates, color and drawing mode.
const drawShape = (coords, color, drawingMode) => {
  let renderingdata = [];
  // only render points which are in view
  if (drawingMode == gl.TRIANGLES) {
    renderingdata = utils.returnInViewPoints(coords);
  } else {
    renderingdata = [...coords];
  }

  renderText(renderingdata, waferMaptTestData);


  // drawRadarView(renderingdata);
  // Step 3
  let data = new Float32Array(renderingdata);
  let buffer = utils.createAndBindBuffer(
    gl,
    gl.ARRAY_BUFFER,
    gl.STATIC_DRAW,
    data
  );
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

  gl.drawArrays(drawingMode, 0, renderingdata.length / 2);
};
const getDiff = (startX, startY, endX, endY) => {
  var obj = {
    startX: startX,
    startY: startY,
    endX: endX,
    endY,
  };
  var v = utils.getGPUCoords(obj, {
    width: gl.canvas.width,
    height: gl.canvas.height,
  }); //-1 to +1
  v = utils.getGPUCoords0To2(v); //0 to 2
  var diffX = v.endX - v.startX;
  var diffY = v.endY - v.startY;
  return {
    x: diffX,
    y: diffY,
  };
};

const updateReticlesOnPanning = (reticle, diff) => {
  for (let i = 0; i < reticle.length; i++) {
    if (i % 2 == 0) {
      reticle[i] += diff.x;
    } else {
      reticle[i] += diff.y;
    }
  }
  return reticle;
};

const zoomOutHelper = (reticleMask) => {
  for (let i = 0; i < reticleMask.length; i++) {
    if (i % 2 == 0) {
      reticleMask[i] -= reticleMask[i] * zoomRatio;
    } else {
      reticleMask[i] -= reticleMask[i] * zoomRatio;
    }
  }
  return reticleMask;
};

const zoomInHelper = (reticleMask) => {
  for (let i = 0; i < reticleMask.length; i++) {
    if (i % 2 == 0) {
      reticleMask[i] += reticleMask[i] * zoomRatio;
    } else {
      reticleMask[i] += reticleMask[i] * zoomRatio;
    }
  }
  return reticleMask;
};

// ----------------- FUNCTION CALLING ---------------------
// reticle Drawing
let obj = utils.waferMapDataToGPU(waferMaptTestData, dieWidth, dieHeight, {
  width: gl.canvas.width,
  height: gl.canvas.height,
});
reticleMask = obj.reticleMask;
canvasUpdatedCoord = obj.canvasUpdatedCoord;
// inViewWafer = [...reticleMask]
let lastReticleMask = [...reticleMask];
drawShape(reticleMask, dieColor, gl.TRIANGLES);

// ------------------- MOUSE EVENTS HANDLER -----------------
initializeEvents(
  gl,
  (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    reticleMask = updateReticlesOnPanning(reticleMask, diff);
    drawShape(reticleMask, dieColor, gl.TRIANGLES);
    reticleMask = [...lastReticleMask];
  },
  (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    lastReticleMask = updateReticlesOnPanning(lastReticleMask, diff);
    reticleMask = [...lastReticleMask];
  },
  (deltaY) => {
    if (deltaY > 0) {
      //zoom out
      reticleMask = zoomOutHelper(reticleMask);
    } else {
      //zoom in
      reticleMask = zoomInHelper(reticleMask);
    }
    drawShape(reticleMask, dieColor, gl.TRIANGLES);
    lastReticleMask = [...reticleMask];
  }
);
