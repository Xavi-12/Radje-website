var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");
var spinBtn = document.getElementById("spinBtn");
var addNameBtn = document.getElementById("addNameBtn");
var nameInput = document.getElementById("nameInput");
var nameList = document.getElementById("nameList");
var result = document.getElementById("result");
var names = [];
var angle = 0;
var isSpinning = false;
function drawWheel(currentAngle) {
    var _a;
    var total = names.length || 1;
    var arc = (2 * Math.PI) / total;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < total; i++) {
        var startAngle = arc * i + currentAngle;
        var endAngle = startAngle + arc;
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
        ctx.fillText(((_a = names[i]) === null || _a === void 0 ? void 0 : _a.name) || "Voeg namen toe", 230, 10);
        ctx.restore();
    }
    // Pointer rechts (3 uur richting)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(500, 250);
    ctx.lineTo(480, 240);
    ctx.lineTo(480, 260);
    ctx.fill();
}
function updateNameList() {
    nameList.innerHTML = "";
    for (var i = 0; i < names.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = "\n      <img src=\"".concat(names[i].photo, "\" class=\"avatar\" />\n      <span>").concat(names[i].name, "</span>\n      <button class=\"removeBtn\" data-index=\"").concat(i, "\">Verwijder</button>\n    ");
        nameList.appendChild(li);
    }
    drawWheel((angle * Math.PI) / 180);
    document.querySelectorAll(".removeBtn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var idx = +btn.dataset.index;
            names.splice(idx, 1);
            updateNameList();
        });
    });
}
function spinWheel() {
    if (isSpinning || names.length === 0)
        return;
    isSpinning = true;
    result.textContent = "";
    var total = names.length;
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
            var finalAngle = angle % 360;
            var index = Math.floor((finalAngle / 360) * names.length) % names.length;
            showWinnerPopup(names[index], index);
        }
    }
    requestAnimationFrame(animate);
}
function showWinnerPopup(person, index) {
    var popup = document.createElement("div");
    popup.className = "winner-popup";
    popup.innerHTML = "\n    <img src=\"".concat(person.photo, "\" class=\"winner-photo\" />\n    <div class=\"winner-name\">\uD83C\uDF89 Winnaar: ").concat(person.name, "!</div>\n    <button id=\"removeWinner\">Verwijder naam</button>\n    <button id=\"closePopup\">Sluiten</button>\n  ");
    document.body.appendChild(popup);
    document.getElementById("removeWinner").onclick = function () {
        names.splice(index, 1);
        updateNameList();
        popup.remove();
    };
    document.getElementById("closePopup").onclick = function () { return popup.remove(); };
}
addNameBtn.addEventListener("click", function () {
    var _a;
    var name = nameInput.value.trim();
    var fileInput = document.getElementById("photoInput");
    var file = (_a = fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
    if (name && file && !names.some(function (n) { return n.name === name; })) {
        var reader = new FileReader();
        reader.onload = function (e) {
            names.push({ name: name, photo: e.target.result });
            nameInput.value = "";
            fileInput.value = "";
            updateNameList();
        };
        reader.readAsDataURL(file);
    }
});
spinBtn.addEventListener("click", spinWheel);
updateNameList();
