var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");
var nameInput = document.getElementById("nameInput");
var imageInput = document.getElementById("imageInput");
var addBtn = document.getElementById("addBtn");
var spinBtn = document.getElementById("spinBtn");
var result = document.getElementById("result");
var winnerImage = document.getElementById("winnerImage");
var entriesList = document.getElementById("entriesList");
var entries = [];
var angle = 0;
var isSpinning = false;
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
        // Tekst op sector
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "18px Arial";
        ctx.fillText(entry.name, 230, 10);
        ctx.restore();
    }
    // Pointer
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(240, 20);
    ctx.lineTo(260, 20);
    ctx.fill();
}
function spinWheel() {
    if (isSpinning || entries.length === 0)
        return;
    isSpinning = true;
    result.textContent = "";
    winnerImage.style.display = "none";
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
function detectWinner() {
    var pointerX = 250;
    var pointerY = 20;
    var pixel = ctx.getImageData(pointerX, pointerY, 1, 1).data;
    var rgb = "#".concat(toHex(pixel[0])).concat(toHex(pixel[1])).concat(toHex(pixel[2])).toUpperCase();
    var winner = entries.find(function (e) { return e.color.toUpperCase() === rgb; });
    if (winner) {
        result.textContent = "\uD83C\uDF89 Winnaar: ".concat(winner.name);
        winnerImage.src = winner.imageUrl;
        winnerImage.style.display = "block";
    }
    else {
        result.textContent = "Geen winnaar gedetecteerd.";
    }
}
function toHex(n) {
    return n.toString(16).padStart(2, '0');
}
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
        var removeBtn = document.createElement("button");
        removeBtn.textContent = "Verwijder";
        removeBtn.onclick = function () {
            entries.splice(index, 1);
            drawWheel((angle * Math.PI) / 180);
            updateEntriesList();
        };
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(removeBtn);
        entriesList.appendChild(card);
    });
}
addBtn.addEventListener("click", function () {
    var _a;
    var name = nameInput.value.trim();
    var file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!name || !file)
        return;
    var reader = new FileReader();
    reader.onload = function () {
        var imageUrl = reader.result;
        var newEntry = {
            name: name,
            color: getRandomColor(),
            imageUrl: imageUrl
        };
        entries.push(newEntry);
        nameInput.value = "";
        imageInput.value = "";
        drawWheel((angle * Math.PI) / 180);
        updateEntriesList();
    };
    reader.readAsDataURL(file);
});
spinBtn.addEventListener("click", spinWheel);
