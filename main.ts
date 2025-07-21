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
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const total = entries.length;
  
  if (total === 0) {
    // Draw empty wheel
    ctx.beginPath();
    ctx.fillStyle = "#f8f9fa";
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "#6c757d";
    ctx.font = "18px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Add entries to start", centerX, centerY);
    return;
  }
  
  const arc = (2 * Math.PI) / total;

  for (let i = 0; i < total; i++) {
    const entry = entries[i];
    const startAngle = arc * i + currentAngle;
    const endAngle = startAngle + arc;

    // Draw sector
    ctx.beginPath();
    ctx.fillStyle = entry.color;
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Poppins";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 2;
    ctx.fillText(entry.name, radius - 20, 5);
    ctx.restore();
  }
  
  // Remove the canvas pointer drawing - we use CSS pointer instead
}

function spinWheel() {
  if (isSpinning || entries.length === 0) return;

  isSpinning = true;
  result.textContent = "";

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
  const centerX = canvas.width / 2;
  const pointerY = 20; // Adjusted for CSS pointer position
  const pixel = ctx.getImageData(centerX, pointerY, 1, 1).data;
  const rgb = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`.toUpperCase();

  const winner = entries.find(e => e.color.toUpperCase() === rgb);
  if (winner) {
    currentWinner = winner;
    createWinnerModal(winner);
  } else {
    result.textContent = "🎯 Spin again for better luck!";
  }
}

function createWinnerModal(winner: Entry) {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';

  const winnerTitle = document.createElement('h2');
  winnerTitle.textContent = '🎉 Winner!';
  winnerTitle.className = 'winner-title';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'close-btn';

  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';

  const winnerName = document.createElement('div');
  winnerName.textContent = winner.name;
  winnerName.className = 'winner-name';

  const winnerImage = document.createElement('img');
  winnerImage.src = winner.imageUrl;
  winnerImage.className = 'winner-image-modal';

  const winnerActions = document.createElement('div');
  winnerActions.className = 'winner-actions';

  const keepBtn = document.createElement('button');
  keepBtn.innerHTML = '<span>✅ Keep Player</span>';
  keepBtn.className = 'btn btn-keep';

  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '<span>❌ Remove Player</span>';
  removeBtn.className = 'btn btn-remove';

  // Event listeners
  const closeModal = () => {
    document.body.removeChild(modalOverlay);
    document.body.style.overflow = 'auto';
    currentWinner = null;
  };

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  keepBtn.addEventListener('click', () => {
    result.innerHTML = `🎉 <strong>${winner.name} stays in the game!</strong>`;
    closeModal();
  });

  removeBtn.addEventListener('click', () => {
    const index = entries.findIndex(e => e === winner);
    if (index > -1) {
      entries.splice(index, 1);
      drawWheel((angle * Math.PI) / 180);
      result.innerHTML = `👋 <strong>${winner.name} has been removed!</strong>`;
    }
    closeModal();
  });

  // Assemble modal
  modalHeader.appendChild(winnerTitle);
  modalHeader.appendChild(closeBtn);
  winnerActions.appendChild(keepBtn);
  winnerActions.appendChild(removeBtn);
  modalBody.appendChild(winnerName);
  modalBody.appendChild(winnerImage);
  modalBody.appendChild(winnerActions);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalOverlay.appendChild(modalContent);

  // Add to DOM
  document.body.appendChild(modalOverlay);
  document.body.style.overflow = 'hidden';
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

// Add responsive canvas sizing
function resizeCanvas() {
  const container = canvas.parentElement!;
  const containerWidth = container.clientWidth;
  const size = Math.min(containerWidth - 60, 400); // More padding
  canvas.width = size;
  canvas.height = size;
  drawWheel((angle * Math.PI) / 180);
}

// Initialize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      document.body.removeChild(modal);
      document.body.style.overflow = 'auto';
    }
  }
});
