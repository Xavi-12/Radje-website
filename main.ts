window.addEventListener('DOMContentLoaded', () => {
    // ...plaats hier AL je bestaande code...
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

function drawWheel(angle = 0) {
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    const radius = wheel.width / 2;
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const sliceAngle = 2 * Math.PI / entries.length;

    for (let i = 0; i < entries.length; i++) {
        const startAngle = angle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Colorful slices
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = `hsl(${i * 360 / entries.length}, 70%, 60%)`;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Name text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.font = "bold 20px Segoe UI";
        ctx.fillStyle = "#2d3a4b";
        ctx.fillText(entries[i].name, radius - 20, 10);
        ctx.restore();
    }
}

function spinWheel() {
    if (spinning || entries.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    winnerDisplay.textContent = "";

    const spins = Math.floor(Math.random() * 3) + 5; // 5-7 spins
    const finalIndex = Math.floor(Math.random() * entries.length);
    winnerIndex = finalIndex;
    const sliceAngle = 2 * Math.PI / entries.length;
    const finalAngle = (3 * Math.PI / 2) - (finalIndex * sliceAngle) - (sliceAngle / 2);

    let start = currentAngle;
    let end = finalAngle + spins * 2 * Math.PI;
    let duration = 4000;
    let startTime: number | null = null;

    function animateWheel(ts: number) {
        if (!startTime) startTime = ts;
        let elapsed = ts - startTime;
        let progress = Math.min(elapsed / duration, 1);
        let ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
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
            <img src="${winner.image}" alt="Foto van ${winner.name}" style="max-width:120px; border-radius:12px; margin-top:10px;">
        </div>
        <button class="removeBtn" id="removeWinnerBtn">Winnaar verwijderen</button>
    `;
    document.getElementById('removeWinnerBtn')!.onclick = () => {
        entries.splice(winnerIndex!, 1);
        winnerIndex = null;
        drawWheel(currentAngle);
        winnerDisplay.textContent = "";
        renderNamesList();
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