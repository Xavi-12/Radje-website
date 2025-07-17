window.addEventListener('DOMContentLoaded', () => {
    // ...plaats hier AL je bestaande code...
interface Participant {
    name: string;
    photo?: string; // base64 image string
    color: string;
}

const participants: Participant[] = [];
const wheel = document.getElementById('wheel') as HTMLCanvasElement;
const ctx = wheel.getContext('2d')!;
const spinBtn = document.getElementById('spin-btn') as HTMLButtonElement;

// Helper: random bright color
function brightColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 90%, 55%)`;
}

// Draw wheel
function drawWheel(rotation = 0) {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const n = participants.length;
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = wheel.width / 2 - 10;
    let startAngle = rotation;
    for (let i = 0; i < n; i++) {
        const sliceAngle = (2 * Math.PI) / n;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = participants[i].color;
        ctx.fill();
        ctx.stroke();
        // Draw name
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.font = "18px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText(participants[i].name, radius - 20, 0);
        ctx.restore();
        startAngle += sliceAngle;
    }
    drawPin();
}

// Draw pin above the wheel
function drawPin() {
    ctx.save();
    ctx.translate(wheel.width / 2, 20);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -30);
    ctx.lineTo(15, -30);
    ctx.closePath();
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.restore();
}

// Spin logic
let spinning = false;
let angle = 0;
let targetAngle = 0;
let winnerIndex = 0;

function spinWheel() {
    if (participants.length === 0 || spinning) return;
    spinning = true;
    const n = participants.length;
    const sliceAngle = (2 * Math.PI) / n;
    winnerIndex = Math.floor(Math.random() * n);
    // Target angle so winner is at top (pin points to center of slice)
    targetAngle = (3 * Math.PI / 2) - (winnerIndex * sliceAngle) - (sliceAngle / 2) + (2 * Math.PI * 5); // 5 rounds
    animateSpin();
}

function animateSpin() {
    if (angle < targetAngle) {
        angle += (targetAngle - angle) / 15 + 0.02;
        ctx.save();
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        ctx.translate(wheel.width / 2, wheel.height / 2);
        ctx.rotate(angle);
        ctx.translate(-wheel.width / 2, -wheel.height / 2);
        drawWheel();
        ctx.restore();
        requestAnimationFrame(animateSpin);
    } else {
        spinning = false;
        angle = targetAngle % (2 * Math.PI);
        showWinnerPopup();
    }
}

// Winner popup with remove button
function showWinnerPopup() {
    const winner = participants[winnerIndex];
    const popup = document.createElement('div');
    popup.className = 'winner-popup';
    popup.innerHTML = `
        <div class="winner-content">
            <img src="${winner.photo || ''}" style="width:100px;height:100px;border-radius:50%;background:${winner.photo ? 'none' : winner.color};object-fit:cover;">
            <h2>${winner.name}</h2>
            <button id="remove-winner-btn">Verwijder winnaar van het rad</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Verwijder popup na 5 seconden automatisch
    const autoClose = setTimeout(() => popup.remove(), 5000);

    // Verwijder winnaar knop
    const removeBtn = document.getElementById('remove-winner-btn');
    removeBtn?.addEventListener('click', () => {
        participants.splice(winnerIndex, 1);
        drawWheel();
        clearTimeout(autoClose);
        popup.remove();
    });
}

// Add participant UI
const form = document.querySelector('.add-form') as HTMLFormElement;
const nameInput = form.querySelector('#name-input') as HTMLInputElement;
const photoInput = form.querySelector('#photo-input') as HTMLInputElement;
const previewImg = form.querySelector('#preview-img') as HTMLImageElement;

photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target?.result as string;
            previewImg.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    let photo = previewImg.src || '';
    if (!name) return;
    participants.push({
        name,
        photo: photo && previewImg.style.display !== 'none' ? photo : undefined,
        color: brightColor()
    });
    nameInput.value = '';
    photoInput.value = '';
    previewImg.src = '';
    previewImg.style.display = 'none';
    drawWheel();
});

// Init
drawWheel();
spinBtn.addEventListener('click', spinWheel);
});