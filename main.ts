window.addEventListener('DOMContentLoaded', () => {
interface WheelEntry {
    name: string;
    image: string; // Data URL
}

let entries: WheelEntry[] = [];
let spinning = false;
let currentAngle = 0;
let winnerIndex: number | null = null;

const wheel = document.getElementById('wheel') as HTMLCanvasElement;
const ctx = wheel.getContext('2d')!;
const spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
const winnerDisplay = document.getElementById('winnerDisplay') as HTMLDivElement;
const addNameForm = document.getElementById('addNameForm') as HTMLFormElement;
const nameInput = document.getElementById('nameInput') as HTMLInputElement;
const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const namesList = document.getElementById('namesList') as HTMLUListElement;
const picker = document.querySelector('.picker') as HTMLDivElement;

// Mooie gouden pick boven het wiel
function updatePicker() {
    picker.style.left = '50%';
    picker.style.top = (wheel.offsetTop - 30) + 'px';
    picker.style.transform = 'translateX(-50%)';
    picker.style.width = '0';
    picker.style.height = '0';
    picker.style.borderLeft = '18px solid transparent';
    picker.style.borderRight = '18px solid transparent';
    picker.style.borderBottom = '38px solid gold';
    picker.style.borderRadius = '6px';
    picker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    picker.style.position = 'absolute';
    picker.style.zIndex = '2';
}
updatePicker();
window.addEventListener('resize', updatePicker);

function drawWheel(angle = 0) {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const radius = wheel.width / 2;
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const sliceAngle = 2 * Math.PI / entries.length;

    for (let i = 0; i < entries.length; i++) {
        const startAngle = angle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Mooie gradient slices
        const grad = ctx.createLinearGradient(centerX, centerY, centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
        grad.addColorStop(0, `hsl(${i * 360 / entries.length}, 80%, 65%)`);
        grad.addColorStop(1, `hsl(${i * 360 / entries.length + 20}, 70%, 50%)`);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Naam tekst
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.font = "bold 20px Segoe UI";
        ctx.fillStyle = "#2d3a4b";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 4;
        ctx.fillText(entries[i].name, radius - 30, 10);
        ctx.restore();
    }
}

function spinWheel() {
    if (spinning || entries.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    winnerDisplay.textContent = "";

    // Krachtigere draai: meer spins en random tijd
    const spins = Math.floor(Math.random() * 4) + 7; // 7-10 rondjes
    const finalIndex = Math.floor(Math.random() * entries.length);
    winnerIndex = finalIndex;
    const sliceAngle = 2 * Math.PI / entries.length;
    const finalAngle = (3 * Math.PI / 2) - (finalIndex * sliceAngle) - (sliceAngle / 2);

    let start = currentAngle;
    let end = finalAngle + spins * 2 * Math.PI;
    let duration = Math.floor(Math.random() * 1200) + 3200; // 3200-4400ms
    let startTime: number | null = null;

    function animateWheel(ts: number) {
        if (!startTime) startTime = ts;
        let elapsed = ts - startTime;
        let progress = Math.min(elapsed / duration, 1);
        // Sterkere ease out
        let ease = 1 - Math.pow(1 - progress, 4);
        currentAngle = start + (end - start) * ease;
        drawWheel(currentAngle);

        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            spinning = false;
            spinBtn.disabled = false;
            showWinner();
        }
    }
    requestAnimationFrame(animateWheel);
}

function showWinner() {
    if (winnerIndex === null) return;
    const winner = entries[winnerIndex];
    winnerDisplay.innerHTML = `
        <div>
            <strong>Winnaar: ${winner.name}</strong><br>
            <img src="${winner.image}" alt="Foto van ${winner.name}" style="max-width:120px; border-radius:12px; margin-top:10px; box-shadow:0 4px 16px gold;">
        </div>
        <div style="margin-top:10px;">
            <button class="removeBtn" id="removeWinnerBtn">Winnaar verwijderen</button>
            <button class="removeBtn" id="keepWinnerBtn" style="background:#27ae60; margin-left:8px;">Winnaar houden</button>
        </div>
    `;
    document.getElementById('removeWinnerBtn')!.onclick = () => {
        entries.splice(winnerIndex!, 1);
        winnerIndex = null;
        drawWheel(currentAngle);
        winnerDisplay.textContent = "";
        renderNamesList();
    };
    document.getElementById('keepWinnerBtn')!.onclick = () => {
        winnerDisplay.textContent = "";
        winnerIndex = null;
    };
}

function renderNamesList() {
    namesList.innerHTML = "";
    entries.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${entry.image}" alt="Foto van ${entry.name}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
            ${entry.name}
            <button class="removeBtn" data-idx="${idx}">Verwijder</button>
        `;
        (li.querySelector('.removeBtn') as HTMLButtonElement)!.onclick = () => {
            entries.splice(idx, 1);
            drawWheel(currentAngle);
            renderNamesList();
        };
        namesList.appendChild(li);
    });
}

addNameForm.onsubmit = (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const file = imageInput.files?.[0];
    if (!name || !file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        entries.push({ name, image: ev.target!.result as string });
        nameInput.value = "";
        imageInput.value = "";
        drawWheel(currentAngle);
        renderNamesList();
    };
    reader.readAsDataURL(file);
};

spinBtn.onclick = spinWheel;

// Initial draw
drawWheel();
renderNamesList();
});