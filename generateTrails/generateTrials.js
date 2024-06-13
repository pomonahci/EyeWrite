const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const generateButton = document.getElementById('generateButton');
const imageCountInput = document.getElementById('imageCount');
const imageSizeInput = document.getElementById('imageSize');
let O_coords = {};

const canvasWidth = 700;
const canvasHeight = 500;
const minDistance = 50;

canvas.width = canvasWidth;
canvas.height = canvasHeight;


function drawLetter(letter, x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 0, 0);
  ctx.strokeStyle = 'red'; // Add this line to set the stroke color to red
  ctx.lineWidth = 1; // Add this line to set the stroke width
  const textMetrics = ctx.measureText(letter);
  const rectWidth = textMetrics.width + 6;
  const rectHeight = parseInt(ctx.font, 10) + 6;

  ctx.restore();

  const topLeftX = x - rectWidth / 2;
  const topLeftY = y - rectHeight / 2;
  const topRightX = x + rectWidth / 2;
  const topRightY = y - rectHeight / 2;
  const bottomLeftX = x - rectWidth / 2;
  const bottomLeftY = y + rectHeight / 2;
  const bottomRightX = x + rectWidth / 2;
  const bottomRightY = y + rectHeight / 2;
  // ctx.fillStyle = 'red';
  // ctx.beginPath();
  // ctx.arc(topLeftX, topLeftY, 3, 0, 2 * Math.PI);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(topRightX, topRightY, 3, 0, 2 * Math.PI);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(bottomLeftX, bottomLeftY, 3, 0, 2 * Math.PI);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(bottomRightX, bottomRightY, 3, 0, 2 * Math.PI);
  // ctx.fill();

  if (letter === 'O') {
    O_coords = {
      topLeft: { x: topLeftX, y: topLeftY },
      topRight: { x: topRightX, y: topRightY },
      bottomLeft: { x: bottomLeftX, y: bottomLeftY },
      bottomRight: { x: bottomRightX, y: bottomRightY }
    };
  } 
}

function isOverlapping(x, y, positions) {
  for (const pos of positions) {
    const dx = x - pos.x;
    const dy = y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      return true;
    }
  }
  return false;
}

function generateImage(hasO) {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth + 30, canvasHeight +30);

  const positions = [];
  const letterCount = parseInt(imageSizeInput.value);
  for (let i = 0; i < letterCount; i++) {
    let x, y;
    do {
      x = Math.random() * (canvasWidth);
      y = Math.random() * (canvasHeight);
      while (x < 30 || x > canvasWidth - 30 || y < 30 || y > canvasHeight - 30) {
        x = Math.random() * (canvasWidth);
        y = Math.random() * (canvasHeight);
      }
    } while (isOverlapping(x, y, positions));
    positions.push({ x, y });
    const rotation = Math.floor(Math.random() * 4) * 90;

    if (hasO && i === 0) {
      drawLetter('O', x, y, rotation);
    } else {
      drawLetter('Q', x, y, rotation);
    }
  }
}

function downloadImage(filename) {
  const dataURL = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.click();
}



function generateAndDownloadImages() {
  const imageCount = parseInt(imageCountInput.value);
  const trialsData = [];

  for (let i = 1; i <= imageCount; i++) {
    generateImage(true);

    document.body.appendChild(canvas);
    canvas.style.display = 'block';
    canvas.style.border= '1px solid black';
    const presentData = {
      name: `${imageSizeInput.value}_present_${i}.jpg`,
      id: i,
      absent: false,
      size: parseInt(imageSizeInput.value),
      O_coordinates: O_coords
    };
    trialsData.push(presentData);
    downloadImage(`${imageSizeInput.value}_present_${i}.jpg`);

    
    generateImage(false);
    const absentData = {
      name: `${imageSizeInput.value}_absent_${i}.jpg`,
      id: i,
      absent: true,
      size: parseInt(imageSizeInput.value),
      O_coordinates: O_coords
    };
    trialsData.push(absentData);
    downloadImage(`${imageSizeInput.value}_absent_${i}.jpg`);
  }
    console.log(trialsData);
    const jsonString = JSON.stringify(trialsData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trials.json';
    link.click();
    URL.revokeObjectURL(url);
  
}

generateButton.addEventListener('click', generateAndDownloadImages);