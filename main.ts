window.addEventListener('DOMContentLoaded', () => {
interface Participant {
    name: string;
    photo?: string;
    color: string;
}

const participants: Participant[] = [];
const wheel = document.getElementById('wheel') as HTMLCanvasElement;
const ctx = wheel.getContext('2d')!;
const spinBtn = document.getElementById('spin-btn') as HTMLButtonElement;

// Helper: random bright color
function brightColor(hue?: number) {
    hue = hue ?? Math.floor(Math.random() * 360);
    return `hsl(${hue}, 90%, 55%)`;
}

// Draw wheel (rotation in radians)
function drawWheel(rotation = 0) {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const n = participants.length;
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = wheel.width / 2 - 10;
    let startAngle = rotation;
    for (let i = 0; i < n; i++) {
        const sliceAngle = (2 * Math.PI) / n;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();

        // Gradient slice
        const hue = Math.floor((360 / n) * i);
        const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
        grad.addColorStop(0, brightColor(hue));
        grad.addColorStop(1, brightColor((hue + 20) % 360));
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw name
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.font = "bold 20px Montserrat, Arial, sans-serif";
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#ffa751";
        ctx.shadowBlur = 8;
        ctx.fillText(participants[i].name, radius - 30, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
        startAngle += sliceAngle;
    }
}

// Draw pin above the wheel (fixed position)
function drawPin() {
    ctx.save();
    ctx.translate(wheel.width / 2, 20);
    ctx.beginPath();
    ctx.arc(0, -20, 16, 0, 2 * Math.PI);
    ctx.fillStyle = "#e74c3c";
    ctx.shadowColor = "#ff9800";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -30);
    ctx.lineTo(12, -30);
    ctx.closePath();
    ctx.fillStyle = "#ff9800";
    ctx.fill();
    ctx.restore();
}

// Spin logic
let spinning = false;
let angle = 0;
let winnerIndex = 0;
let animationFrame: number;

function spinWheel() {
    if (participants.length === 0 || spinning) return;
    spinning = true;
    const extraSpins = Math.floor(Math.random() * 3) + 5; // 5-7 rounds
    const randomOffset = Math.random() * 2 * Math.PI;
    const finalAngle = extraSpins * 2 * Math.PI + randomOffset;
    const duration = 3000; // ms
    const start = performance.now();
    const startAngle = angle;

    function animate(now: number) {
        const elapsed = now - start;
        if (elapsed < duration) {
            // Ease out
            const t = elapsed / duration;
            angle = startAngle + (finalAngle - startAngle) * easeOutCubic(t);
            render();
            animationFrame = requestAnimationFrame(animate);
        } else {
            angle = (startAngle + finalAngle) % (2 * Math.PI);
            spinning = false;
            render();
            showWinnerPopup();
        }
    }
    animationFrame = requestAnimationFrame(animate);
}

// Easing function for smooth animation
function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

// Render wheel and pin
function render() {
    ctx.save();
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    ctx.translate(wheel.width / 2, wheel.height / 2);
    ctx.rotate(angle);
    ctx.translate(-wheel.width / 2, -wheel.height / 2);
    drawWheel(0);
    ctx.restore();
    drawPin();
}

// Determine winner based on where the pin points
function getWinnerIndex() {
    const n = participants.length;
    const sliceAngle = (2 * Math.PI) / n;
    let normalized = (3 * Math.PI / 2 - angle) % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;
    return Math.floor(normalized / sliceAngle) % n;
}

// Winner popup with remove button
function showWinnerPopup() {
    winnerIndex = getWinnerIndex();
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
        render();
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
    render();
});

// Init
render();
spinBtn.addEventListener('click', spinWheel);
});