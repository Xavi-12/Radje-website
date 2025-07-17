// main.ts
interface Entry {
  name: string;
  color: string;
  imageUrl: string;
}

const canvas = document.getElementById("wheel") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const imageInput = document.getElementById("imageInput") as HTMLInputElement;
const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
const spinBtn = document.getElementById("spinBtn") as HTMLButtonElement;
const result = document.getElementById("result") as HTMLDivElement;
const winnerImage = document.getElementById("winnerImage") as HTMLImageElement;

let entries: Entry[] = [];
let angle = 0;
let isSpinning = false;

function getRandomColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function drawWheel(currentAngle: number) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const total = entries.length;
  const arc = (2 * Math.PI) / total;

  for (let i = 0; i < total; i++) {
    const entry = entries[i];
    const startAngle = arc * i + currentAngle;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.fillStyle = entry.color;
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, startAngle, endAngle);
    ctx.fill();

    // Tekst op sector
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "18px Arial";
    ctx.fillText(entry.name, 230, 10);
    ctx.restore();
  }

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(240, 20);
  ctx.lineTo(260, 20);
  ctx.fill();
}

function spinWheel() {
  if (isSpinning || entries.length === 0) return;

  isSpinning = true;
  result.textContent = "";
  winnerImage.style.display = "none";

  const spinAngle = Math.random() * 360 + 360 * 5;
  const duration = 4000;
  const start = performance.now();
  const initial = angle;

  function animate(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    angle = initial + eased * spinAngle;
    drawWheel((angle * Math.PI) / 180);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      detectWinner();
    }
  }

  requestAnimationFrame(animate);
}

function detectWinner() {
  const pointerX = 250;
  const pointerY = 30;
  const pixel = ctx.getImageData(pointerX, pointerY, 1, 1).data;
  const rgb = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`.toUpperCase();

  const winner = entries.find(e => e.color.toUpperCase() === rgb);
  if (winner) {
    result.textContent = `🎉 Winnaar: ${winner.name}`;
  } else {
    result.textContent = "Geen winnaar gedetecteerd.";
  }
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

addBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const file = imageInput.files?.[0];
  if (!name || !file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imageUrl = reader.result as string;
    const newEntry: Entry = {
      name,
      color: getRandomColor(),
      imageUrl
    };
    entries.push(newEntry);
    nameInput.value = "";
    imageInput.value = "";
    drawWheel((angle * Math.PI) / 180);
  };
  reader.readAsDataURL(file);
});

spinBtn.addEventListener("click", spinWheel);