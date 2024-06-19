const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const generateButton = document.getElementById('generateButton');
const gameButton = document.getElementById('gameButton');
const imageCountInput = document.getElementById('imageCount');
const imageSizeInput = document.getElementById('imageSize');
let coords = {};

const canvasWidth = 2200;
const canvasHeight = 1250;
const minDistance = 150;


canvas.width = canvasWidth;
canvas.height = canvasHeight;


function drawLetter(letter, x, y, rotation, i) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.fillStyle = 'black';
  ctx.font = '0.24in Slab';
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
  coords = {...coords, 
    [`letter_${i}`]: letter,
    [`x_${i}`]: x,
    [`y_${i}`]: y,
    [`rotation_${i}`]: rotation
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
  for (let i = 1; i <= letterCount; i++) {
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

    if (hasO && i === 1) {
      drawLetter('O', x, y, rotation, i);
    } else {
      drawLetter('Q', x, y, rotation, i);
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

function generateCSV(data) {
  const header = [
    'absent', 'id', 'name', 'size',
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => `letter_${i + 1}`),
    ...Array.from({ length:parseInt(imageSizeInput.value) }, (_, i) => `rotation_${i + 1}`),
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => `x_${i + 1}`),
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => `y_${i + 1}`)
  ];
  const rows = data.map(item => [
    item.absent,
    item.id,
    item.name,
    item.size,
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => item[`letter_${i + 1}`] || ''),
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => item[`rotation_${i + 1}`] || ''),
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => item[`x_${i + 1}`] || ''),
    ...Array.from({ length: parseInt(imageSizeInput.value) }, (_, i) => item[`y_${i + 1}`] || '')
  ]);

  return [header, ...rows].map(row => row.join(',')).join('\n');
}


function appendToCSV(csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${imageSizeInput.value}_trials.csv`;
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


function generateAndDownloadImages() {
  const imageCount = parseInt(imageCountInput.value);
  const trialsData = [];

  let i = 1;
  const downloadNextImage = () => {
    if (i <= imageCount) {
      coords = {};
      generateImage(true);
      const presentData = {
        name: `${imageSizeInput.value}_present_${i}.jpg`,
        id: i,
        absent: false,
        size: parseInt(imageSizeInput.value),
        ...coords
      };
      trialsData.push(presentData);
      downloadImage(`${imageSizeInput.value}_present_${i}.jpg`);

      setTimeout(() => {
        coords = {};
        generateImage(false);
        const absentData = {
          name: `${imageSizeInput.value}_absent_${i}.jpg`,
          id: i,
          absent: true,
          size: parseInt(imageSizeInput.value),
          ...coords
        };

        trialsData.push(absentData);
        downloadImage(`${imageSizeInput.value}_absent_${i}.jpg`);

        i++;
        downloadNextImage();
      }, 1000); // 1 second delay between each download
    } else {
      console.log(trialsData);
      const csvContent = generateCSV(trialsData);
      appendToCSV(csvContent);
      document.body.appendChild(canvas);
      canvas.style.display = 'block';
      canvas.style.border = '1px solid black';
    }
  };

  downloadNextImage();
}

let score = 0;
function OamongQ() {
  // const targetAbsentButton = document.createElement('button');
  // targetAbsentButton.textContent = 'Target Absent';
  // document.body.appendChild(targetAbsentButton);
  let score = 0;
  generateImage(true)
  document.body.appendChild(canvas);
  canvas.style.display = 'block';
  canvas.style.border= '1px solid black';
}
   
generateButton.addEventListener('click', generateAndDownloadImages);
gameButton.addEventListener('click', OamongQ);




canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  let clickedOnO = false;
  const letters = []

  for (let i = 0; i < Object.keys(coords).length / 4; i++) {
    const letter = coords[`letter_${i}`];
    letters.push(letter);
    const x = coords[`x_${i}`];
    const y = coords[`y_${i}`];
    const rotation = coords[`rotation_${i}`];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    const textMetrics = ctx.measureText(letter);
    const rectWidth = textMetrics.width + 6;
    const rectHeight = parseInt(ctx.font, 10) + 6;
    console.log(rectWidth, rectHeight);
    console.log("w",rectWidth,"H", rectHeight);
    ctx.restore();

    const topLeftX = x - rectWidth / 2;
    const topLeftY = y - rectHeight / 2;
    const bottomRightX = x + rectWidth / 2;
    const bottomRightY = y + rectHeight / 2;

    if (
      clickX >= topLeftX &&
      clickX <= bottomRightX &&
      clickY >= topLeftY &&
      clickY <= bottomRightY
    ) {
      if (letter === 'O') {
        clickedOnO = true;
        alert('Clicked on O!');
        generateImage(true);
        score++;
        document.getElementById('gameScore').textContent = score; // Update gameScore element
      } else {
        alert('Clicked on Q!');
      }
    }
      // if (targetAbsentButton.contains(event.target)) {
      //   generateImage(Math.random() < 0.5);
      //   if (!letters.includes('O')) {
      //     score++;
      //   }
      // }

  }
});
