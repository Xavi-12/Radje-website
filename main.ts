window.addEventListener('DOMContentLoaded', () => {
interface Participant {
  name: string;
  image: HTMLImageElement;
}

const canvas = document.getElementById("wheel") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const spinBtn = document.getElementById("spinBtn")!;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const imageInput = document.getElementById("imageInput") as HTMLInputElement;
const addNameForm = document.getElementById("addNameForm")!;
const namesList = document.getElementById("namesList")!;
const winnerDisplay = document.getElementById("winnerDisplay")!;
const picker = document.querySelector(".picker")!;
const previewContainer = document.getElementById("previewContainer")!;

let participants: Participant[] = [];
let isSpinning = false;
let rotation = 0;
let spinVelocity = 0;

function drawWheel() {
  // Responsive canvas
  const size = Math.min(canvas.parentElement!.clientWidth, 500);
  canvas.width = size;
  canvas.height = size;
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (participants.length === 0) {
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#e0e0e0";
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#888";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Voeg namen toe!", radius, radius);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(radius - 10, 0);
    ctx.lineTo(radius + 10, 0);
    ctx.lineTo(radius, 20);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    return;
  }

  const sliceAngle = (2 * Math.PI) / participants.length;

  participants.forEach((participant, index) => {
    const startAngle = index * sliceAngle + rotation;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fillStyle = `hsl(${(index * 360) / participants.length}, 80%, 60%)`;
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(participant.name, radius - 10, 5);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.moveTo(radius - 10, 0);
  ctx.lineTo(radius + 10, 0);
  ctx.lineTo(radius, 20);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

function spinWheel() {
  if (participants.length === 0 || isSpinning) return;

  isSpinning = true;
  const maxSpinTime = 4000 + Math.random() * 2000;
  spinVelocity = (Math.PI * 4) + Math.random() * Math.PI * 2;
  const start = performance.now();

  function animate(time: number) {
    const elapsed = time - start;
    const t = elapsed / maxSpinTime;
    const easeOut = 1 - Math.pow(1 - t, 3);

    rotation += spinVelocity * (1 - easeOut) * 0.02;
    rotation %= 2 * Math.PI;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      pickWinner();
    }
  }

  requestAnimationFrame(animate);
}

function pickWinner() {
  const sliceAngle = (2 * Math.PI) / participants.length;
  let normalizedRotation = (2 * Math.PI - (rotation % (2 * Math.PI))) % (2 * Math.PI);
  const index = Math.floor(normalizedRotation / sliceAngle);
  const winner = participants[index];

  if (!winner) return;

  const container = document.createElement("div");
  container.className = "winner-popup";

  const nameEl = document.createElement("h2");
  nameEl.textContent = `🎉 Winnaar: ${winner.name}`;

  const img = document.createElement("img");
  img.src = winner.image.src;
  img.style.maxWidth = "200px";
  img.style.borderRadius = "10px";
  img.style.display = "block";
  img.style.margin = "0 auto 16px auto";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Verwijder van het rad";
  removeBtn.className = "popup-btn";
  removeBtn.onclick = () => {
    participants.splice(index, 1);
    drawWheel();
    renderList();
    renderNames();
    container.remove();
  };

  const keepBtn = document.createElement("button");
  keepBtn.textContent = "Laat op het rad";
  keepBtn.className = "popup-btn";
  keepBtn.onclick = () => container.remove();

  container.append(nameEl, img, removeBtn, keepBtn);

  winnerDisplay.innerHTML = "";
  winnerDisplay.appendChild(container);
  winnerDisplay.style.display = "flex";
}

addNameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const file = imageInput.files?.[0];
  if (!name || !file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      participants.push({ name, image: img });
      nameInput.value = "";
      imageInput.value = "";
      drawWheel();
      renderList();
      renderNames();
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
});

function renderList() {
  namesList.innerHTML = "";
  participants.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.name;
    namesList.appendChild(li);
  });
}

function renderNames() {
  previewContainer.innerHTML = "";
  participants.forEach((p) => {
    const entry = document.createElement("div");
    entry.className = "preview-entry";

    const img = document.createElement("img");
    img.src = p.image.src;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";

    const name = document.createElement("span");
    name.textContent = p.name;
    name.style.marginLeft = "8px";

    entry.appendChild(img);
    entry.appendChild(name);
    previewContainer.appendChild(entry);
  });
}

spinBtn.addEventListener("click", spinWheel);

// Redraw wheel on resize for responsiveness
window.addEventListener("resize", drawWheel);

drawWheel();

});