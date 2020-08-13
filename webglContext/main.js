var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext("webgl2");
//0.0 -> 1.0 in case of GPU
gl.clearColor(0, 0, 1.0, 1.0);
gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT)
console.log(gl);
