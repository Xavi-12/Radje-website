window.addEventListener('DOMContentLoaded', () => {
// HTML-elementen ophalen
const form = document.getElementById('player-form') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const imageInput = document.getElementById('image') as HTMLInputElement;
const canvas = document.getElementById('wheel') as HTMLCanvasElement;
const spinButton = document.getElementById('spin-btn') as HTMLButtonElement;
const winnerPopup = document.getElementById('winner-popup') as HTMLDivElement;
const winnerName = document.getElementById('winner-name') as HTMLHeadingElement;
const winnerImage = document.getElementById('winner-image') as HTMLImageElement;
const closePopupBtn = document.getElementById('close-popup') as HTMLButtonElement;

const ctx = canvas.getContext('2d')!;
canvas.width = 400;
canvas.height = 400;

// Data opslaan
interface Player {
  name: string;
  image: string; // base64
}
const players: Player[] = [];

let rotation = 0;
let isSpinning = false;

// Kleurengenerator
function getColor(index: number): string {
  const hue = index * (360 / players.length);
  return `hsl(${hue}, 70%, 60%)`;
}

// Rad tekenen
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const radius = canvas.width / 2;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const anglePerSlice = (2 * Math.PI) / players.length;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  players.forEach((player, i) => {
    const startAngle = i * anglePerSlice;
    const endAngle = startAngle + anglePerSlice;

    // Slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.fillStyle = getColor(i);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Naam
    ctx.save();
    ctx.rotate(startAngle + anglePerSlice / 2);
    ctx.translate(radius * 0.65, 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, 0, 0);
    ctx.restore();
  });

  ctx.restore();

  drawPointer();
}

// Pointer tekenen (bovenkant)
function drawPointer() {
  const size = 20;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - size / 2, 10);
  ctx.lineTo(canvas.width / 2 + size / 2, 10);
  ctx.lineTo(canvas.width / 2, 30);
  ctx.fillStyle = '#000';
  ctx.fill();
}

// Winnaar bepalen op basis van rotatie
function getWinner(): Player {
  const anglePerSlice = 2 * Math.PI / players.length;
  const normalizedRotation = (2 * Math.PI - (rotation % (2 * Math.PI))) % (2 * Math.PI);
  const index = Math.floor(normalizedRotation / anglePerSlice);
  return players[index];
}

// Spin-animatie
function spinWheel() {
  if (isSpinning || players.length === 0) return;

  isSpinning = true;
  const extraRotations = 5 * 2 * Math.PI;
  const randomSlice = Math.floor(Math.random() * players.length);
  const anglePerSlice = 2 * Math.PI / players.length;
  const targetRotation = randomSlice * anglePerSlice;
  const finalRotation = extraRotations + targetRotation;

  const duration = 4000;
  const start = performance.now();
  const initialRotation = rotation;

  function animate(time: number) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    rotation = initialRotation + easeOut * (finalRotation - initialRotation);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      const winner = getWinner();
      showWinner(winner);
    }
  }

  requestAnimationFrame(animate);
}

// Winnaar-popup tonen
function showWinner(player: Player) {
  winnerName.textContent = player.name;
  winnerImage.src = player.image;
  winnerPopup.classList.add('visible');
}

// Events
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const file = imageInput.files?.[0];

  if (!name || !file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imageBase64 = reader.result as string;
    players.push({ name, image: imageBase64 });
    nameInput.value = '';
    imageInput.value = '';
    drawWheel();
  };
  reader.readAsDataURL(file);
});

spinButton.addEventListener('click', spinWheel);
closePopupBtn.addEventListener('click', () => {
  winnerPopup.classList.remove('visible');
});

// Eerste keer tekenen (leeg rad)
drawWheel();


});