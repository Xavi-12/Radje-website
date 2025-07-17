const canvas = document.getElementById("wheel") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const spinBtn = document.getElementById("spinBtn") as HTMLButtonElement;
const addNameBtn = document.getElementById("addNameBtn") as HTMLButtonElement;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const nameList = document.getElementById("nameList")!;
const result = document.getElementById("result") as HTMLDivElement;

type Person = { name: string; photo: string };

let names: Person[] = [];
let angle = 0;
let isSpinning = false;

function drawWheel(currentAngle: number) {
  const total = names.length || 1;
  const arc = (2 * Math.PI) / total;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < total; i++) {
    const startAngle = arc * i + currentAngle;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff6600";
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, startAngle, endAngle);
    ctx.fill();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText(names[i]?.name || "Voeg namen toe", 230, 10);
    ctx.restore();
  }

  // Pointer rechts (3 uur richting)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(500, 250);
  ctx.lineTo(480, 240);
  ctx.lineTo(480, 260);
  ctx.fill();
}

function updateNameList() {
  nameList.innerHTML = "";
  for (let i = 0; i < names.length; i++) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${names[i].photo}" class="avatar" />
      <span>${names[i].name}</span>
      <button class="removeBtn" data-index="${i}">Verwijder</button>
    `;
    nameList.appendChild(li);
  }
  drawWheel((angle * Math.PI) / 180);

  document.querySelectorAll(".removeBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = +(btn as HTMLButtonElement).dataset.index!;
      names.splice(idx, 1);
      updateNameList();
    });
  });
}

function spinWheel() {
  if (isSpinning || names.length === 0) return;

  isSpinning = true;
  result.textContent = "";

  const total = names.length;
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
      const finalAngle = angle % 360;
      const index = Math.floor((finalAngle / 360) * names.length) % names.length;
      showWinnerPopup(names[index], index);
    }
  }

  requestAnimationFrame(animate);
}

function showWinnerPopup(person: Person, index: number) {
  const popup = document.createElement("div");
  popup.className = "winner-popup";
  popup.innerHTML = `
    <img src="${person.photo}" class="winner-photo" />
    <div class="winner-name">🎉 Winnaar: ${person.name}!</div>
    <button id="removeWinner">Verwijder naam</button>
    <button id="closePopup">Sluiten</button>
  `;
  document.body.appendChild(popup);

  document.getElementById("removeWinner")!.onclick = () => {
    names.splice(index, 1);
    updateNameList();
    popup.remove();
  };
  document.getElementById("closePopup")!.onclick = () => popup.remove();
}

addNameBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const fileInput = document.getElementById("photoInput") as HTMLInputElement;
  const file = fileInput.files?.[0];

  if (name && file && !names.some(n => n.name === name)) {
    const reader = new FileReader();
    reader.onload = function(e) {
      names.push({ name, photo: e.target!.result as string });
      nameInput.value = "";
      fileInput.value = "";
      updateNameList();
    };
    reader.readAsDataURL(file);
  }
});

spinBtn.addEventListener("click", spinWheel);
updateNameList();
