// // Setting Up WEBGL 2.0
let radarUtils = new WebGLUtils();
let radar = document.getElementById("radar");
let radarGl = radarUtils.getGlContext(radar);
radarGl.clearColor(1.0, 1.0, 1.0, 0.5);
radarGl.clear(radarGl.DEPTH_BUFFER_BIT | radarGl.COLOR_BUFFER_BIT);

// Initialize Variable
let radarMap = [];
let inViewWafer = []
let centerOfRadar1 = 40;
let centerOfRadar2 = 85;
let widthOfRadar = 6;
let heightOfRadar = 12;
let radarWidthDyes = 20;
let radarHeightDyes = 10;

// Generating Wafer Map Test Data..
let radarWaferMap = radarUtils.randomWaferDataWithBinNum(
  centerOfRadar1,
  centerOfRadar2,
  widthOfRadar,
  heightOfRadar,
  [1, 2, 3, 4, 5, 6, 7, 8, 9]
);

console.log(radarWaferMap.length);

// Step 1: Writing Shaders
let radarVertexShader = `#version 300 es
precision mediump float;
in vec2 position;  
uniform vec2 a_position;
uniform mat3 u_matrix;
void main() {
    gl_Position = vec4(position.x,position.y*-1.0, 0.0, 1.0);
}`;
let radarFragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec4 reticleColor;
void main() {
    color = reticleColor; // r,g,b,a 
}
`;

// // Step 2: Creating Program
let radarProgram = radarUtils.getProgram(
  radarGl,
  radarVertexShader,
  radarFragmentShader
);

const drawRadar = (coords, color, drawingMode) => {
  let renderingdata = [...coords];
  // Step 3
  let data = new Float32Array(renderingdata);
  let radarBuffer = radarUtils.createAndBindBuffer(
    radarGl,
    radarGl.ARRAY_BUFFER,
    radarGl.STATIC_DRAW,
    data
  );

  // Step 4
  radarGl.useProgram(radarProgram);
  radarUtils.linkGPUAndCPU(
    {
      program: radarProgram,
      buffer: radarBuffer,
      dims: 2,
      gpuVariable: "position",
    },
    radarGl
  );

  let reticleColor = radarGl.getUniformLocation(radarProgram, "reticleColor");
  radarGl.uniform4fv(reticleColor, color);

  // Step 5

  radarGl.drawArrays(drawingMode, 0, renderingdata.length / 2);
};

const drawRadarView = (inViewData) => {
  if (inViewData) {
    startX = inViewData[0]
    startY = inViewData[1]
    endX = inViewData[inViewData.length-2]
    endY = inViewData[inViewData.length-1]
    v = radarUtils.prepareRectVec2(startX,startY,endX,endY)
    // drawRadar(v, [1.0, 1.0, 0.0, 0.5], radarGl.TRIANGLES);
  }
};

// reticle Drawing
radarMap = radarUtils.waferMapDataToGPU(
  radarWaferMap,
  radarWidthDyes,
  radarHeightDyes,
  { width: radarGl.canvas.width, height: radarGl.canvas.height }
);
drawRadar(radarMap, [1.0, 0.0, 0.0, 1.0], radarGl.TRIANGLES);
