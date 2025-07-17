const canvas = document.getElementById("wheel") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const spinBtn = document.getElementById("spinBtn") as HTMLButtonElement;
const addNameBtn = document.getElementById("addNameBtn") as HTMLButtonElement;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const nameList = document.getElementById("nameList")!;
const result = document.getElementById("result") as HTMLDivElement;

let names: string[] = ["Alice", "Bob", "Cindy", "David"];
let angle = 0;
let isSpinning = false;

function drawWheel(currentAngle: number) {
  const total = names.length;
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
    ctx.fillText(names[i], 230, 10);
    ctx.restore();
  }

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(240, 20);
  ctx.lineTo(260, 20);
  ctx.fill();
}

function updateNameList() {
  nameList.innerHTML = "";
  for (const name of names) {
    const li = document.createElement("li");
    li.textContent = name;
    nameList.appendChild(li);
  }
  drawWheel((angle * Math.PI) / 180);
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
      const index = Math.floor(names.length - (finalAngle / 360) * names.length) % names.length;
      result.textContent = `🎉 Winnaar: ${names[index]}!`;
    }
  }

  requestAnimationFrame(animate);
}

addNameBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name && !names.includes(name)) {
    names.push(name);
    nameInput.value = "";
    updateNameList();
  }
});

spinBtn.addEventListener("click", spinWheel);
updateNameList();
