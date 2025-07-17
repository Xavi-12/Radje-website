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

let participants: Participant[] = [];
let isSpinning = false;
let rotation = 0;
let spinVelocity = 0;

function drawWheel() {
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sliceAngle = (2 * Math.PI) / participants.length;

  participants.forEach((participant, index) => {
    const startAngle = index * sliceAngle + rotation;
    const endAngle = startAngle + sliceAngle;

    // Color
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fillStyle = `hsl(${(index * 360) / participants.length}, 80%, 60%)`;
    ctx.fill();
    ctx.closePath();

    // Text
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(participant.name, radius - 10, 5);
    ctx.restore();
  });

  // Draw picker
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
  let spinTime = 0;
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
  const index = participants.length - Math.floor((rotation % (2 * Math.PI)) / sliceAngle) - 1;
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

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Verwijder van het rad";
  removeBtn.onclick = () => {
    participants.splice(index, 1);
    drawWheel();
    renderList();
    renderNames();
    container.remove();
  };

  const keepBtn = document.createElement("button");
  keepBtn.textContent = "Laat op het rad";
  keepBtn.onclick = () => container.remove();

  container.append(nameEl, img, removeBtn, keepBtn);
  winnerDisplay.innerHTML = "";
  winnerDisplay.appendChild(container);
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
  let previewContainer = document.getElementById("previewContainer");
  if (!previewContainer) {
    previewContainer = document.createElement("div");
    previewContainer.id = "previewContainer";
    document.querySelector(".container")?.appendChild(previewContainer);
  }

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
    previewContainer!.appendChild(entry);
  });
}

spinBtn.addEventListener("click", spinWheel);

drawWheel();

});