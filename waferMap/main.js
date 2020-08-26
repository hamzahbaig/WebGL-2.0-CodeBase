// Setting Up WEBGL 2.0
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
let gridOuterLines = [
  { startX: 0, startY: 0, endX: 0, endY: canvas.height },
  { startX: 0, startY: canvas.height, endX: canvas.width, endY: canvas.height },
  { startX: canvas.width, startY: canvas.height, endX: canvas.width, endY: 0 },
  { startX: canvas.width, startY: 0, endX: 0, endY: 0 },
];
let centerOfEclipse1 = 135;
let centerOfEclipse2 = 250;
let widthOfEclipse = 8;
let heightOfEclipse = 16;
let width = 64;
let height = 32;

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
  // gl.drawArrays(mode, first, count)
  gl.drawArrays(drawingMode, 0, coords.length / 2);
};

// Function is used to draw outer grid for wafer map
gridDrawing = (gridOuterLines) => {
  for (let i = 0; i < gridOuterLines.length; i++) {
    let v = utils.getGPUCoords(gridOuterLines[i]);
    let lineCoords = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
    drawShape(lineCoords, [0.0, 0.0, 0.0, 1.0], gl.LINES);
  }
};

// This function is to convert wafer Map test data into GPU data
const waferMapDataToGPU = (waferMaptTestData) => {
  let reticleMask = [];
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
        reticleMask,
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
        reticleMask,
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
        reticleMask,
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
        reticleMask,
        waferMaptTestData[i].x + offsetX,
        waferMaptTestData[i].y,
        offsetY
      );
      offsetY += height;
    }
  }
  return reticleMask;
};

// This function is to update the Coords.
let updateCoords = (reticleMask, x, y, offsetY) => {
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

let getDiff = (startX, startY, endX, endY) => {
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

// ----------------- FUNCTION CALLING ---------------------
// reticle Drawing
reticleMask = waferMapDataToGPU(waferMaptTestData);
let lastReticleMask = [...reticleMask];
drawShape(reticleMask, [1.0, 0.0, 0.0, 1.0], gl.TRIANGLES);

// grid Drawing
gridDrawing(gridOuterLines);

initializeEvents(
  gl,
  (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    for (let i = 0; i < reticleMask.length; i++) {
      if (i % 2 == 0) {
        reticleMask[i] += diff.x;
      } else {
        reticleMask[i] += diff.y;
      }
    }
    drawShape(reticleMask, [1.0, 0.0, 0.0, 1.0], gl.TRIANGLES);
    gridDrawing(gridOuterLines);
    reticleMask = [...lastReticleMask];
  },
  (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    for (let i = 0; i < reticleMask.length; i++) {
      if (i % 2 == 0) {
        lastReticleMask[i] += diff.x;
      } else {
        lastReticleMask[i] += diff.y;
      }
    }

    reticleMask = [...lastReticleMask];
  },
  (deltaY) => {
    if (deltaY > 0) {
      //zoom out
      for (let i = 0; i < reticleMask.length; i++) {
        if (i % 2 == 0) {
          reticleMask[i] -= reticleMask[i] * 0.1;
        } else {
          reticleMask[i] -= reticleMask[i] * 0.1;
        }
      }
    } else {
      //zoom in
      for (let i = 0; i < reticleMask.length; i++) {
        if (i % 2 == 0) {
          reticleMask[i] += reticleMask[i] * 0.1;
        } else {
          reticleMask[i] += reticleMask[i] * 0.1;
        }
      }
    }
    drawShape(reticleMask, [1.0, 0.0, 0.0, 1.0], gl.TRIANGLES);
    gridDrawing(gridOuterLines);
    lastReticleMask = [...reticleMask];
  }
);
