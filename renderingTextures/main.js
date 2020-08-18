var utils = new WebGLUtils();
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGlContext(canvas);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Step 1
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position; //vertices: WebGL vertex coordinates
in vec2 texCoords; // Texture Coordinates
out vec2 textureCoords; //Take input from vertex shader and serve to fragment shader
void main() {
    textureCoords = texCoords;
    gl_Position = vec4(position,0.0,1.0);
}
`;

var fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D first, second;
uniform float activeIndex;
out vec4 color;
void main() {
  if (activeIndex == 0.0) {
    color = texture(first,textureCoords);
  } else {
    color = texture(second,textureCoords);

  }
}
`;

// Step 2
var program = utils.getProgram(gl, vertexShader, fragmentShader);

// Step 3
var vertices = utils.prepareRectVec2(-1.0, -1.0, 1.0, 1.0);
var textureCoordinates = utils.prepareRectVec2(0.0, 1.0, 1.0, 0.0);

var render1 = document.getElementById("render1");
var render2 = document.getElementById("render2");

gl.useProgram(program);
var activeIndex = gl.getUniformLocation(program, "activeIndex");

render1.onclick = () => {
  // render firstImage
  gl.uniform1f(activeIndex, 0.0);
  render(texture);
};

render2.onclick = () => {
  // render secondImage
  gl.uniform1f(activeIndex, 1.0);
  render(secondTexture);
};

var buffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(vertices)
);
var texBuffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(textureCoordinates)
);

var secondTexture, texture;
var image = new Image();
var secondImage = new Image();
image.src = "./first.jpg";
secondImage.src = "./second.jpg";

secondImage.onload = () => {
  secondTexture = utils.createAndBindTexture(gl, secondImage);
};
image.onload = () => {
  texture = utils.createAndBindTexture(gl, image);
};

var render = (texture) => {
  // Step 4
  utils.linkGPUAndCPU(
    {
      program: program,
      buffer: buffer,
      dims: 2,
      gpuVariable: "position",
    },
    gl
  );
  utils.linkGPUAndCPU(
    {
      program: program,
      buffer: texBuffer,
      dims: 2,
      gpuVariable: "texCoords",
    },
    gl
  );
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Step 5
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
};
