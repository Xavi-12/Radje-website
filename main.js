var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");
var nameInput = document.getElementById("nameInput");
var imageInput = document.getElementById("imageInput");
var addBtn = document.getElementById("addBtn");
var spinBtn = document.getElementById("spinBtn");
var entriesList = document.getElementById("entriesList");
var winnerPopup = document.getElementById("winnerPopup");
var winnerNameEl = document.getElementById("winnerName");
var winnerPhoto = document.getElementById("winnerPhoto");
var removeWinnerBtn = document.getElementById("removeWinnerBtn");
var keepWinnerBtn = document.getElementById("keepWinnerBtn");
var entries = [];
var angle = 0;
var isSpinning = false;
var lastWinnerIndex = null;
function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function drawWheel(currentAngle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var total = entries.length;
    if (total === 0)
        return;
    var arc = (2 * Math.PI) / total;
    for (var i = 0; i < total; i++) {
        var entry = entries[i];
        var startAngle = arc * i + currentAngle;
        var endAngle = startAngle + arc;
        ctx.beginPath();
        ctx.fillStyle = entry.color;
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, startAngle, endAngle);
        ctx.fill();
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial";
        ctx.fillText(entry.name, 230, 10);
        ctx.restore();
    }
    // Pointer
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(240, 30);
    ctx.lineTo(260, 30);
    ctx.closePath();
    ctx.fill();
}
function toHex(n) {
    return n.toString(16).padStart(2, "0");
}
function detectWinner() {
    var pixel = ctx.getImageData(250, 25, 1, 1).data;
    var rgb = "#".concat(toHex(pixel[0])).concat(toHex(pixel[1])).concat(toHex(pixel[2])).toUpperCase();
    var winnerIndex = entries.findIndex(function (e) { return e.color.toUpperCase() === rgb; });
    if (winnerIndex >= 0) {
        lastWinnerIndex = winnerIndex;
        showWinnerPopup(entries[winnerIndex]);
    }
    else {
        alert("Geen winnaar gevonden.");
    }
}
function spinWheel() {
    if (isSpinning || entries.length === 0)
        return;
    isSpinning = true;
    var spinAngle = Math.random() * 360 + 360 * 5;
    var duration = 4000;
    var start = performance.now();
    var initial = angle;
    function animate(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        angle = initial + eased * spinAngle;
        drawWheel((angle * Math.PI) / 180);
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
        else {
            isSpinning = false;
            detectWinner();
        }
    }
    requestAnimationFrame(animate);
}
function showWinnerPopup(winner) {
    winnerNameEl.textContent = "\uD83C\uDF89 ".concat(winner.name);
    winnerPhoto.src = winner.imageUrl;
    winnerPopup.classList.remove("hidden");
}
removeWinnerBtn.onclick = function () {
    if (lastWinnerIndex !== null) {
        entries.splice(lastWinnerIndex, 1);
        drawWheel((angle * Math.PI) / 180);
        updateEntriesList();
    }
    winnerPopup.classList.add("hidden");
};
keepWinnerBtn.onclick = function () {
    winnerPopup.classList.add("hidden");
};
function updateEntriesList() {
    entriesList.innerHTML = "";
    entries.forEach(function (entry, index) {
        var card = document.createElement("div");
        card.className = "entry-card";
        var img = document.createElement("img");
        img.src = entry.imageUrl;
        img.alt = entry.name;
        var name = document.createElement("div");
        name.textContent = entry.name;
        var btn = document.createElement("button");
        btn.textContent = "Verwijder";
        btn.onclick = function () {
            entries.splice(index, 1);
            drawWheel((angle * Math.PI) / 180);
            updateEntriesList();
        };
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(btn);
        entriesList.appendChild(card);
    });
}
addBtn.onclick = function () {
    var _a;
    var name = nameInput.value.trim();
    var file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!name || !file)
        return;
    var reader = new FileReader();
    reader.onload = function () {
        var imageUrl = reader.result;
        entries.push({ name: name, imageUrl: imageUrl, color: getRandomColor() });
        nameInput.value = "";
        imageInput.value = "";
        drawWheel((angle * Math.PI) / 180);
        updateEntriesList();
    };
    reader.readAsDataURL(file);
};
spinBtn.onclick = spinWheel;
