var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");
var nameInput = document.getElementById("nameInput");
var imageInput = document.getElementById("imageInput");
var addBtn = document.getElementById("addBtn");
var spinBtn = document.getElementById("spinBtn");
var nameList = document.getElementById("nameList");
var popup = document.getElementById("popup");
var popupTitle = document.getElementById("popupTitle");
var popupImage = document.getElementById("popupImage");
var removeBtn = document.getElementById("removeBtn");
var keepBtn = document.getElementById("keepBtn");
var entries = [];
var angle = 0;
var isSpinning = false;
var currentWinner = null;
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
        ctx.font = "18px Arial";
        ctx.fillText(entry.name, 230, 10);
        ctx.restore();
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
function detectWinner() {
    var total = entries.length;
    var arc = 360 / total;
    var normalizedAngle = (angle % 360 + 360) % 360;
    var index = Math.floor((360 - normalizedAngle + arc / 2) % 360 / arc);
    var winner = entries[index];
    if (!winner)
        return;
    currentWinner = winner;
    popupTitle.textContent = "\uD83C\uDF89 Winnaar: ".concat(winner.name);
    popupImage.src = winner.imageUrl;
    popup.style.display = "flex";
}
function updateNameList() {
    nameList.innerHTML = "";
    entries.forEach(function (entry) {
        var card = document.createElement("div");
        card.className = "name-card";
        var img = document.createElement("img");
        img.src = entry.imageUrl;
        var text = document.createElement("div");
        text.textContent = entry.name;
        card.appendChild(img);
        card.appendChild(text);
        nameList.appendChild(card);
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
        updateNameList();
    };
    reader.readAsDataURL(file);
});
spinBtn.addEventListener("click", spinWheel);
removeBtn.addEventListener("click", function () {
    if (currentWinner) {
        entries = entries.filter(function (e) { return e !== currentWinner; });
        drawWheel((angle * Math.PI) / 180);
        updateNameList();
    }
    popup.style.display = "none";
});
keepBtn.addEventListener("click", function () {
    popup.style.display = "none";
});
