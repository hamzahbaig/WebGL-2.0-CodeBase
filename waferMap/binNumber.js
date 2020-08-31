let textCanvas = document.getElementById("text");
textCanvas.width = 900;
textCanvas.height = 900;

let ctx = textCanvas.getContext("2d");
ctx.font = "15px Arial";
// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
// ctx.fillText("Hello World",800,800);

const returnDieCoord = (data) => {
  let dieCoord = [];
  for (let i = 0; i < data.length - 11; i += 12) {
    let obj = utils.getHTMLCoords(data[i], data[i + 1], {
      width: ctx.canvas.width,
      height: ctx.canvas.height,
    });
    dieCoord.push({x:obj.x, y: obj.y});
  }
  return dieCoord
};
const renderText = (data, original) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let dieCoord = returnDieCoord(data);
  for (let i = 0; i < dieCoord.length; i++) {
    ctx.fillText(`${original[i].hardBin}`, dieCoord[i].x+20, dieCoord[i].y+20);
  }
};
