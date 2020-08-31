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

  createAndBindBuffer = (gl, bufferType, typeOfDrawing, data) => {
    var buffer = gl.createBuffer(); // allocates some memory in gpu
    // two parameters of bindBuffer
    // target: is channel for sending data from CPU to GPU
    gl.bindBuffer(bufferType, buffer); // bind allocated memory with the channel
    gl.bufferData(bufferType, data, typeOfDrawing); // use this channel and send data to GPU
    gl.bindBuffer(bufferType, null); // Dislocating memory
    return buffer;
  };

  createAndBindTexture = (gl, image) => {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null); // Dislocating memory
    return texture;
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
  getGPUCoords = (obj, canvas) => {
    return {
      startX: -1.0 + (obj.startX / canvas.width) * 2,
      startY: -1.0 + (obj.startY / canvas.height) * 2,
      endX: -1.0 + (obj.endX / canvas.width) * 2,
      endY: -1.0 + (obj.endY / canvas.height) * 2,
    };
  };

  getHTMLCoords = (startX, startY, canvas) => {
    return {
      x: ((startX + 1.0) / 2) * canvas.width,
      y: ((startY + 1.0) / 2) * canvas.height,
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

  getCircleCoordinates = (centerX, centerY, radiusX, numOfPoints, isLine) => {
    var numOfPoints = numOfPoints;
    var circleCoords = [];
    var radiusY = (radiusX / gl.canvas.height) * gl.canvas.width;
    for (var i = 0; i < numOfPoints; i++) {
      var circumference = 2 * Math.PI * (i / numOfPoints);
      var x = centerX + radiusX * Math.cos(circumference);
      var y = centerY + radiusY * Math.sin(circumference);
      if (isLine) {
        circleCoords.push(centerX, centerY);
      }
      circleCoords.push(x, y);
    }
    return circleCoords;
  };

  prepareRectVec2 = (startX, startY, endX, endY) => {
    return [
      startX,
      startY,
      endX,
      startY,
      startX,
      endY,
      startX,
      endY,
      endX,
      endY,
      endX,
      startY,
    ];
  };

  getAspectRatio = (gl, img) => {
    var cols = img.width;
    var rows = img.height;
    var imageAR = cols / rows;
    var canvasAR = gl.canvas.width / gl.canvas.height;
    var startX, startY, renderableW, renderableH;
    if (imageAR < canvasAR) {
      renderableH = gl.canvas.height;
      renderableW = cols * (renderableH / rows);
      startX = (gl.canvas.width - renderableW) / 2;
      startY = 0;
    } else if (imageAR > canvasAR) {
      renderableW = gl.canvas.width;
      renderableH = rows * (renderableW / cols);
      startX = 0;
      startY = (gl.canvas.height - renderableH) / 2;
    } else {
      startX = 0;
      startY = 0;
      (renderableW = gl.canvas.width), (renderableH = gl.canvas.height);
    }
    return {
      x1: startX,
      y1: startY,
      x2: startX + renderableW,
      y2: startY + renderableH,
    };
  };

  checkPoint = (h, k, a, b, x, y) => {
    let p =
      Math.pow(x - h, 2) / Math.pow(a, 2) + Math.pow(y - k, 2) / Math.pow(b, 2);
    return p;
  };
  // centerOfEclipse1,
  // centerOfEclipse2,
  // widthOfEclipse,
  // heightOfEclipse,
  randomWaferDataWithBinNum = (h, k, a, b, bins) => {
    let data = [];
    for (let x = h - a * 2; x < h + a * 2; x++) {
      for (let y = k - b * 2; y < k + b * 2; y++) {
        if (this.checkPoint(h, k, a, b, x, y) < 1.0) {
          data.push({
            x: x,
            y: y,
            hardBin: Math.floor(Math.random() * 999),
          });
        }
      }
    }
    return data;
  };

  // This function only returns the dyes which are visible on canvas
  returnInViewPoints = (coords) => {
    let renderingdata = [];
    for (let i = 0; i < coords.length - 11; i += 12) {
      let rect = [];
      for (let j = i; j < i + 12; j++) {
        if (coords[j] <= 1.0 && coords[j] >= -1.0) {
          rect.push(coords[j]);
        } else {
          rect = [];
          break;
        }
      }
      renderingdata.push(...rect);
    }
    return renderingdata;
  };

  // This function is to convert wafer Map test data into GPU data
  waferMapDataToGPU = (waferMaptTestData, width, height, canvas) => {
    let reticleMask = [];
    let canvasUpdatedCoord = [];
    let dontChangeX = waferMaptTestData[0].x;
    let dontChangeY = waferMaptTestData[0].y;
    let offsetX = 0,
      offsetY = 0;
    for (let i = 0; i < waferMaptTestData.length; i++) {
      if (
        waferMaptTestData[i].x == dontChangeX &&
        waferMaptTestData[i].y >= dontChangeY
      ) {
        this.updateCoords(
          reticleMask,
          canvasUpdatedCoord,
          waferMaptTestData[i].x + offsetX,
          waferMaptTestData[i].y,
          offsetY,
          width,
          height,
          canvas
        );
        offsetY += height;
      } else if (
        waferMaptTestData[i].x != dontChangeX &&
        waferMaptTestData[i].y < dontChangeY
      ) {
        dontChangeX = waferMaptTestData[i].x;
        offsetY = (waferMaptTestData[i].y - dontChangeY) * height;
        offsetX += width;
        this.updateCoords(
          reticleMask,
          canvasUpdatedCoord,
          waferMaptTestData[i].x + offsetX,
          waferMaptTestData[i].y,
          offsetY,
          width,
          height,
          canvas
        );
        offsetY += height;
      } else if (
        waferMaptTestData[i].x == dontChangeX &&
        waferMaptTestData[i].y < dontChangeY
      ) {
        this.updateCoords(
          reticleMask,
          canvasUpdatedCoord,
          waferMaptTestData[i].x + offsetX,
          waferMaptTestData[i].y,
          offsetY,
          width,
          height,
          canvas
        );
        offsetY += height;
      } else if (
        waferMaptTestData[i].x != dontChangeX &&
        waferMaptTestData[i].y >= dontChangeY
      ) {
        dontChangeX = waferMaptTestData[i].x;
        offsetY = 0;
        offsetX += width;
        this.updateCoords(
          reticleMask,
          canvasUpdatedCoord,
          waferMaptTestData[i].x + offsetX,
          waferMaptTestData[i].y,
          offsetY,
          width,
          height,
          canvas
        );
        offsetY += height;
      }
    }
    return {
      reticleMask: reticleMask,
      canvasUpdatedCoord: canvasUpdatedCoord,
    };
  };

  // This function is to update the Coords.
  updateCoords = (
    reticleMask,
    canvasUpdatedCoord,
    x,
    y,
    offsetY,
    width,
    height,
    canvas
  ) => {
    let startX = x,
      startY = y + offsetY;
    canvasUpdatedCoord.push({ x: startX, y: startY });
    let obj = {
      startX,
      startY,
      endX: startX + width,
      endY: startY + height,
    };
    let v = this.getGPUCoords(obj, canvas);
    let reticleCoords = this.prepareRectVec2(
      v.startX,
      v.startY,
      v.endX,
      v.endY
    );
    reticleMask.push(...reticleCoords);
  };
}
