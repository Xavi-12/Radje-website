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
const entriesList = document.getElementById("entriesList") as HTMLDivElement;

const winnerPopup = document.getElementById("winnerPopup") as HTMLDivElement;
const winnerNameEl = document.getElementById("winnerName") as HTMLHeadingElement;
const winnerPhoto = document.getElementById("winnerPhoto") as HTMLImageElement;
const removeWinnerBtn = document.getElementById("removeWinnerBtn") as HTMLButtonElement;
const keepWinnerBtn = document.getElementById("keepWinnerBtn") as HTMLButtonElement;

let entries: Entry[] = [];
let angle = 0;
let isSpinning = false;
let lastWinnerIndex: number | null = null;

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
  lastWinnerIndex = null;
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
  const pointerY = 20;
  const pixel = ctx.getImageData(pointerX, pointerY, 1, 1).data;
  const rgb = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`.toUpperCase();

  const winnerIndex = entries.findIndex(e => e.color.toUpperCase() === rgb);
  if (winnerIndex >= 0) {
    const winner = entries[winnerIndex];
    lastWinnerIndex = winnerIndex;
    showWinnerPopup(winner);
  } else {
    alert("Geen winnaar gedetecteerd.");
  }
}

function showWinnerPopup(winner: Entry) {
  winnerNameEl.textContent = `🎉 ${winner.name}`;
  winnerPhoto.src = winner.imageUrl;
  winnerPopup.classList.remove("hidden");
}

removeWinnerBtn.addEventListener("click", () => {
  if (lastWinnerIndex !== null) {
    entries.splice(lastWinnerIndex, 1);
    drawWheel((angle * Math.PI) / 180);
    updateEntriesList();
  }
  winnerPopup.classList.add("hidden");
});

keepWinnerBtn.addEventListener("click", () => {
  winnerPopup.classList.add("hidden");
});

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

function updateEntriesList() {
  entriesList.innerHTML = "";

  entries.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const img = document.createElement("img");
    img.src = entry.imageUrl;
    img.alt = entry.name;

    const name = document.createElement("div");
    name.textContent = entry.name;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Verwijder";
    removeBtn.onclick = () => {
      entries.splice(index, 1);
      drawWheel((angle * Math.PI) / 180);
      updateEntriesList();
    };

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(removeBtn);
    entriesList.appendChild(card);
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
    updateEntriesList();
  };
  reader.readAsDataURL(file);
});

spinBtn.addEventListener("click", spinWheel);
