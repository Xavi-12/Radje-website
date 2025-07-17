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
const nameList = document.getElementById("nameList") as HTMLDivElement;
const popup = document.getElementById("popup") as HTMLDivElement;
const popupTitle = document.getElementById("popupTitle") as HTMLHeadingElement;
const popupImage = document.getElementById("popupImage") as HTMLImageElement;
const removeBtn = document.getElementById("removeBtn") as HTMLButtonElement;
const keepBtn = document.getElementById("keepBtn") as HTMLButtonElement;

let entries: Entry[] = [];
let angle = 0;
let isSpinning = false;
let currentWinner: Entry | null = null;

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
  if (total === 0) return;
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

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "18px Arial";
    ctx.fillText(entry.name, 230, 10);
    ctx.restore();
  }
}

function spinWheel() {
  if (isSpinning || entries.length === 0) return;

  isSpinning = true;
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
  const total = entries.length;
  const arc = 360 / total;
  const normalizedAngle = (angle % 360 + 360) % 360;
  const index = Math.floor((360 - normalizedAngle + arc / 2) % 360 / arc);
  const winner = entries[index];
  if (!winner) return;
  currentWinner = winner;
  popupTitle.textContent = `🎉 Winnaar: ${winner.name}`;
  popupImage.src = winner.imageUrl;
  popup.style.display = "flex";
}

function updateNameList() {
  nameList.innerHTML = "";
  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "name-card";
    const img = document.createElement("img");
    img.src = entry.imageUrl;
    const text = document.createElement("div");
    text.textContent = entry.name;
    card.appendChild(img);
    card.appendChild(text);
    nameList.appendChild(card);
  });
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
    updateNameList();
  };
  reader.readAsDataURL(file);
});

spinBtn.addEventListener("click", spinWheel);

removeBtn.addEventListener("click", () => {
  if (currentWinner) {
    entries = entries.filter(e => e !== currentWinner);
    drawWheel((angle * Math.PI) / 180);
    updateNameList();
  }
  popup.style.display = "none";
});

keepBtn.addEventListener("click", () => {
  popup.style.display = "none";
});