class WebGLUtils {
  getGlContext = (canvas) => {
    var gl = canvas.getContext("webgl2");
    //0.0 -> 1.0 in case of GPU
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    return gl;
  };

  getShader = (gl, shaderSource, shaderType) => {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  };

  getProgram = (gl, vertexShaderSource, fragmentShaderSource) => {
    var vs = this.getShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fs = this.getShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    return program;
  };

  createAndBindBuffer = (bufferType, typeOfDrawing, data) => {
    var buffer = gl.createBuffer(); // allocates some memory in gpu
    // two parameters of bindBuffer
    // target: is channel for sending data from CPU to GPU
    gl.bindBuffer(bufferType, buffer); // bind allocated memory with the channel
    gl.bufferData(bufferType, data, typeOfDrawing); // use this channel and send data to GPU
    gl.bindBuffer(bufferType, null); // Dislocating memory
    return buffer;
  };

  linkGPUAndCPU = (obj, gl) => {
    var position = gl.getAttribLocation(obj.program, obj.gpuVariable);
    gl.enableVertexAttribArray(position);
    gl.bindBuffer(obj.channel || gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(
      position,
      obj.dims,
      obj.dataType || gl.FLOAT,
      obj.normalize || gl.FALSE,
      obj.stride || 0,
      obj.offset || 0
    );
    return position;
  };
  // GPU coordinates range from 1.0 to 1.0
  // I made the range 0.0 -> 2.0
  // now subtract
  getGPUCoords = (obj) => {
    return {
      startX: -1.0 + (obj.startX / gl.canvas.width) * 2,
      startY: -1.0 + (obj.startY / gl.canvas.height) * 2,
      endX: -1.0 + (obj.endX / gl.canvas.width) * 2,
      endY: -1.0 + (obj.endY / gl.canvas.height) * 2,
    };
  };

  // Input -> -1.0 -> 1.0
  getGPUCoords0To2 = (obj) => {
    return {
      startX: 1.0 + obj.startX,
      startY: 1.0 + obj.startY,
      endX: 1.0 + obj.endX,
      endY: 1.0 + obj.endY,
    };
  };

  getTextureColor = (obj) => {
    return {
      red: obj.startX / gl.canvas.width,
      green: obj.startY / gl.canvas.height,
      blue: obj.endX / gl.canvas.width,
      alpha: obj.endY / gl.canvas.height,
    };
  };
}