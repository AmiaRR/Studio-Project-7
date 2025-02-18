let colorSlider, sizeSlider, saveButton, deleteButton, uploadButton, uploadInput;
let tiles = [];
let tileSize = 150;
let tilesPerRow = 3;
let tileSpacing = 10;
let tileRows = 0;

let canvasWidth = 800;
let canvasHeight = 600;
let tileAreaHeight = 0;

let saveBox = { x: 10, y: 10, w: 120, h: 40 };
let deleteBox = { x: 10, y: 60, w: 120, h: 40 };
let uploadBox = { x: 10, y: 110, w: 120, h: 40 };
let sliderBox = { x: 200, y: 10, w: 220, h: 50 };
let sizeBox = { x: 200, y: 70, w: 220, h: 50 };
let linkBox = { x: 200, y: 130, w: 220, h: 30 };

let drawingLayer, img, brushSound;
let filter;
let currentBrush = 'spray';
let brushButtons = [];
let brushIconSize = 40;
let brushIconSpacing = 10;
let swirlAngle = 0; 
let sliderValue = 127; 


function setup() {
  createCanvas(canvasWidth, canvasHeight);
  userStartAudio();
  background(0);
  colorMode(HSB);

  drawingLayer = createGraphics(canvasWidth, canvasHeight);
  drawingLayer.colorMode(HSB);
  drawingLayer.background(0);

  saveButton = createButton('Save Drawing');
  saveButton.position(saveBox.x + 10, saveBox.y + 10);
  saveButton.mousePressed(saveTile);

  deleteButton = createButton('Clear Canvas');
  deleteButton.position(deleteBox.x + 10, deleteBox.y + 10);
  deleteButton.mousePressed(clearCanvas);

  uploadButton = createButton('Upload Tile');
  uploadButton.position(uploadBox.x + 10, uploadBox.y + 10);
  uploadButton.mousePressed(uploadTile);

  uploadInput = createFileInput(handleFile);
  uploadInput.position(uploadBox.x + 430, uploadBox.y - 80);

  colorSlider = createSlider(0, 255, 127);
  colorSlider.position(sliderBox.x + 10, sliderBox.y + 15);
  colorSlider.style('width', '200px');

  sizeSlider = createSlider(5, 30, 10);
  sizeSlider.position(sizeBox.x + 10, sizeBox.y + 15);
  sizeSlider.style('width', '200px');

  driveLink = createA("https://drive.google.com/drive/folders/1OG6wmp8-Ok1ZJXBj_AYdbthNFJkx5LKn", "View Tile Collection", "_blank");
  driveLink.style("color", "white");
  driveLink.style("text-decoration", "underline");
  driveLink.style("display", "block");
  driveLink.position(linkBox.x, linkBox.y + tileAreaHeight);
  driveLink.style("z-index", "10");

  setupBrushButtons();

  updateCanvasPosition();
}

function draw() {
  background(0);
  if (img) {
    image(img, 0, tileAreaHeight, canvasWidth, canvasHeight);
  }
  image(drawingLayer, 0, tileAreaHeight);
  drawTiles();
  drawUI();
  drawBrushIcons();
  drawBrush();
}

function preload() {
  soundFormats('wav'); 
  brushSound = loadSound('paintbrush1.wav'); 
  };

  filter = new p5.LowPass();
  brushSound.disconnect(); // Disconnect direct output
  brushSound.connect(filter); // Connect to filter
  filter.freq(800); // Lower frequencies = softer sound
  filter.res(5); // Resonance for smoothness



  function mousePressed() {
    if (brushSound && brushSound.isLoaded()) {
      brushSound.setVolume(0.1); // Lower volume (range: 0 to 1)
      brushSound.play();
    }
  }
  
  function mouseReleased() {
    if (brushSound && brushSound.isPlaying()) {
      brushSound.stop();
    }
  }
  
   
function mouseClicked() {
  for (let button of brushButtons) {
    if (mouseX > button.x && mouseX < button.x + brushIconSize &&
        mouseY > button.y && mouseY < button.y + brushIconSize) {
      currentBrush = button.type;
      break;
    }
  }
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      drawingLayer.image(img, 0, 0, canvasWidth, canvasHeight);
    });
  }
}

function drawBrush() {
  if (mouseIsPressed && mouseY > 160) { 
    let hueValue = map(colorSlider.value(), 0, sliderBox.w, 0, 360); 
    let brushSize = sizeSlider.value();
brushSound.loop();
    brushSound.setVolume(0.15); // Further lower the volume while drawing
    fill(hueValue, 100, 100);
    noStroke();

    switch (currentBrush) {
      case 'spray':
        drawSprayBrush(hueValue, brushSize);
        break;
      case 'watercolor':
        drawWatercolorBrush(hueValue, brushSize);
        break;
      case 'pixel':
        drawPixelBrush(hueValue, brushSize);
        break;
    }
  }
}


function drawSprayBrush(hueValue, brushSize) {
  let ctx = drawingLayer.drawingContext;
  ctx.shadowBlur = 15;
  ctx.shadowColor = color(hueValue, 100, 100);

  swirlAngle += 0.1;
  let xOffset = sin(swirlAngle) * 1;
  let yOffset = cos(swirlAngle) * 1;

  drawingLayer.fill(hueValue, 100, 100);
  drawingLayer.noStroke();
  drawingLayer.ellipse(mouseX + xOffset, mouseY - tileAreaHeight + yOffset, brushSize);

  ctx.shadowBlur = 0;
}

function drawWatercolorBrush(hueValue, brushSize) {
  let numParticles = int(random(10, 20));
  for (let i = 0; i < numParticles; i++) {
    let offsetX = random(-5, 5);
    let offsetY = random(-5, 5);
    let size = random(brushSize / 2, brushSize);
    let numParticles = int(random(20, 40)); 
let alpha = random(5, 15);
    let col = color(hueValue, 100, 100, alpha);
   

    drawingLayer.noStroke();
    drawingLayer.fill(col);
    drawingLayer.ellipse(mouseX + offsetX, mouseY - tileAreaHeight + offsetY, size);
  }
}

function drawPixelBrush(hueValue, brushSize) {
  let gridSize = max(1, floor(brushSize / 3));
  let px = floor(mouseX / gridSize) * gridSize;
  let py = floor((mouseY - tileAreaHeight) / gridSize) * gridSize;

  drawingLayer.noStroke();
  drawingLayer.fill(color(hueValue, 100, 100));
  drawingLayer.rect(px, py, gridSize, gridSize);
}

function saveTile() {
  let tile = createGraphics(tileSize, tileSize);
  tile.colorMode(HSB);
  tile.background(0);
  if (img) {
    tile.image(img, 0, 0, tileSize, tileSize);
  }
  tile.image(drawingLayer, 0, 0, tileSize, tileSize);
  tiles.push(tile);
  tileRows = ceil(tiles.length / tilesPerRow);
  tileAreaHeight = (tileSize + tileSpacing) * tileRows + 20;
  updateCanvasPosition();
}

function uploadTile() {
  if (tiles.length === 0) {
    console.log("No tiles to upload!");
    return;
  }

  let tile = tiles[tiles.length - 1];

  tile.elt.toBlob(blob => {
    let formData = new FormData();

    let base64Image = tile.elt.toDataURL("image/png").split(',')[1];

    formData.append("image", base64Image);

    fetch("https://script.google.com/macros/s/AKfycbyIW03hg_wBSZ4cR5QTGC2UbCHk-FrVo05bIivQj0hxltTDib_6yQEg4AFrFasfljY/exec", {
      method: "POST",
      body: formData
    }).then(response => response.text())
      .then(data => {
        console.log("Upload Success:", data);

        alert("Tile uploaded! View collection here: " + data);
      })
      .catch(error => console.error("Upload Failed:", error));
  }, "image/png");
}

function updateCanvasPosition() {
  let newHeight = tileAreaHeight + canvasHeight;
  resizeCanvas(canvasWidth, newHeight);
}

function drawTiles() {
  let xOffset = 10;
  let yOffset = 150;
  for (let i = 0; i < tiles.length; i++) {
    let row = floor(i / tilesPerRow);
    let col = i % tilesPerRow;
    let x = xOffset + col * (tileSize + tileSpacing);
    let y = yOffset + row * (tileSize + tileSpacing);
    fill(0);
    rect(x, y, tileSize, tileSize);
    image(tiles[i], x, y, tileSize, tileSize);
  }
}

function drawUI() { 

  fill(0);
  noStroke();
  rect(0, 0, width, 160); 

  drawBox(saveBox, "Save");
  drawBox(deleteBox, "Delete");
  drawBox(uploadBox, "");
  drawSliderBox();
  drawSizeBox();
  drawColorSlider();
  drawSizeSlider();
}

function drawBox(box, label) {
  fill(50);
  stroke(255);
  rect(box.x, box.y, box.w, box.h);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text(label, box.x + box.w / 2, box.y + box.h / 2);
}

function drawSliderBox() {
  colorMode(HSB); 
  for (let i = 0; i < sliderBox.w; i++) {
    let hueValue = map(i, 0, sliderBox.w, 0, 360); 
    stroke(hueValue, 100, 100);
    line(sliderBox.x + i, sliderBox.y, sliderBox.x + i, sliderBox.y + sliderBox.h);
  }
  noFill();
  stroke(255);
  rect(sliderBox.x, sliderBox.y, sliderBox.w, sliderBox.h);
  colorMode(RGB); 
}
  
  noFill();
  stroke(360);
  rect(sliderBox.x, sliderBox.y, sliderBox.w, sliderBox.h);


function drawSizeBox() {
  fill(50);
  stroke(255);
  rect(sizeBox.x, sizeBox.y, sizeBox.w, sizeBox.h);
}

function drawColorSlider() {
  colorMode(HSB, 255, 100, 100); 
  fill(50);
  stroke(360);
  rect(sliderBox.x, sliderBox.y, sliderBox.w, sliderBox.h);

  
  for (let i = 0; i < sliderBox.w; i++) {
    let hueValue = map(i, 0, sliderBox.w - 1, 0, 255); 
    stroke(hueValue, 100, 100);
    line(sliderBox.x + i, sliderBox.y, sliderBox.x + i, sliderBox.y + sliderBox.h);
  }
}


function getSelectedColor() {
  let hueValue = map(sliderValue, 0, sliderBox.w - 1, 0, 255); 
  return color(hueValue, 100, 100);
}


function mousePressed() {
  if (mouseY > sliderBox.y && mouseY < sliderBox.y + sliderBox.h && 
      mouseX > sliderBox.x && mouseX < sliderBox.x + sliderBox.w) {
    sliderValue = mouseX - sliderBox.x; 
    brushColor = getSelectedColor(); 
  }
}


function drawSizeSlider() {
  fill(50);
  stroke(255);
  rect(sizeBox.x, sizeBox.y, sizeBox.w, sizeBox.h);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('', sizeBox.x + sizeBox.w / 2, sizeBox.y + sizeBox.h / 2);
}

function clearCanvas() {
  drawingLayer.clear();
  drawingLayer.background(0);
}

function setupBrushButtons() {
  let startY = 10;
  let startX = 140;
  let brushTypes = ['spray', 'watercolor', 'pixel'];

  for (let i = 0; i < brushTypes.length; i++) {
    let y = startY + i * (brushIconSize + brushIconSpacing);
    brushButtons.push({
      x: startX,
      y: y,
      type: brushTypes[i]
    });
  }
}

function drawBrushIcons() {
  colorMode(HSB, 360, 100, 100, 100); 
  
  
  fill(0);
  noStroke();
  rect(brushButtons[0].x - 5, brushButtons[0].y - 5, brushIconSize + 10, brushIconSize * 3 + 20);

  for (let i = 0; i < brushButtons.length; i++) {
    let button = brushButtons[i];
    let isSelected = currentBrush === button.type;

    
    let alpha = (i === 1) ? 50 : 100;  

    
    let baseHue = 320; 
    let selectedHue = 280; 
    let buttonColor = isSelected ? color(selectedHue, 100, 100, alpha) : color(baseHue, 100, 100, alpha);

    fill(buttonColor);
    stroke(0);

    if (i === 0) {
      
      let centerX = button.x + brushIconSize / 2;
      let centerY = button.y + brushIconSize / 2;
      
      for (let j = 0; j < 60; j++) { 
        let angle = random(TWO_PI);
        let radius = random(0, brushIconSize / 2); 
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;
        let dotSize = random(2, 5);
        fill(buttonColor); 
        ellipse(x, y, dotSize);
      }
    } 
    else if (i === 1) {
      
      let centerX = button.x + brushIconSize / 2;
      let centerY = button.y + brushIconSize / 2;
      let blobSize = brushIconSize * 0.8;

      fill(buttonColor);
      noStroke();
      ellipse(centerX, centerY, blobSize);
    } 
    else {
      
      rect(button.x, button.y, brushIconSize, brushIconSize);
    }
  }
}


function mousePressed() {
  for (let button of brushButtons) {
    if (
      mouseX > button.x && mouseX < button.x + brushIconSize &&
      mouseY > button.y && mouseY < button.y + brushIconSize
    ) {
      currentBrush = button.type; 
      return; 
    }
  }

  
  drawBrushStroke();
} 

