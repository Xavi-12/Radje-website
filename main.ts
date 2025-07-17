const canvas = document.getElementById('wheel') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
const namesForm = document.getElementById('namesForm') as HTMLFormElement;
const namesInput = document.getElementById('namesInput') as HTMLTextAreaElement;
const winnerPopup = document.getElementById('winnerPopup') as HTMLDivElement;
const winnerNameElem = document.getElementById('winnerName') as HTMLParagraphElement;
const closePopupBtn = document.getElementById('closePopupBtn') as HTMLButtonElement;

let names: string[] = [];
let startAngle = 0;
let arc = 0;
let spinning = false;
let finalAngle = 0;

const FULL_ROTATION = 2 * Math.PI;

function drawWheel(): void {
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const outsideRadius = Math.min(centerX, centerY) - 10;
  const textRadius = outsideRadius - 40;
  const insideRadius = 50;

  ctx.clearRect(0, 0, width, height);

  arc = FULL_ROTATION / names.length;

  for (let i = 0; i < names.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = `hsl(${(i * 360) / names.length}, 70%, 70%)`;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.translate(
      centerX + Math.cos(angle + arc / 2) * textRadius,
      centerY + Math.sin(angle + arc / 2) * textRadius
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Arial';
    const text = names[i].length > 12 ? names[i].slice(0, 12) + '…' : names[i];
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, insideRadius, 0, FULL_ROTATION);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function spin(): void {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;

  const rotations = Math.random() * 3 + 3;
  const randomAngle = Math.random() * FULL_ROTATION;
  const totalRotation = rotations * FULL_ROTATION + randomAngle;

  const duration = 5000;
  const startTime = performance.now();

  function animate(time: number) {
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easeOutCubic(t);
    startAngle = (totalRotation * easedT) % FULL_ROTATION;
    finalAngle = startAngle;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      spinBtn.disabled = false;
      determineWinner();
    }
  }

  requestAnimationFrame(animate);
}

function determineWinner(): void {
  const winnerIndex = Math.floor((finalAngle % FULL_ROTATION) / arc);
  winnerNameElem.textContent = names[winnerIndex];
  winnerPopup.classList.remove('hidden');
}

namesForm.addEventListener('submit', e => {
  e.preventDefault();
  const inputText = namesInput.value.trim();
  if (!inputText) {
    alert('Voer minstens 1 naam in.');
    return;
  }

  names = inputText.split('\n').map(n => n.trim()).filter(n => n.length > 0);

  if (names.length < 2) {
    alert('Voer minstens 2 namen in.');
    return;
  }

  startAngle = 0;
  drawWheel();
  spinBtn.disabled = false;
});

spinBtn.addEventListener('click', spin);

closePopupBtn.addEventListener('click', () => {
  winnerPopup.classList.add('hidden');
});

window.onload = () => {
  spinBtn.disabled = true;
};
