var canvas = document.getElementById("wheel");
var ctx = canvas.getContext("2d");
var spinBtn = document.getElementById("spinBtn");
var addNameBtn = document.getElementById("addNameBtn");
var nameInput = document.getElementById("nameInput");
var nameList = document.getElementById("nameList");
var result = document.getElementById("result");
var names = ["Alice", "Bob", "Cindy", "David"];
var angle = 0;
var isSpinning = false;
function drawWheel(currentAngle) {
    var total = names.length;
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
        ctx.fillText(names[i], 230, 10);
        ctx.restore();
    }
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(240, 20);
    ctx.lineTo(260, 20);
    ctx.fill();
}
function updateNameList() {
    nameList.innerHTML = "";
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name_1 = names_1[_i];
        var li = document.createElement("li");
        li.textContent = name_1;
        nameList.appendChild(li);
    }
    drawWheel((angle * Math.PI) / 180);
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
            var index = Math.floor(names.length - (finalAngle / 360) * names.length) % names.length;
            result.textContent = "\uD83C\uDF89 Winnaar: ".concat(names[index], "!");
        }
    }
    requestAnimationFrame(animate);
}
addNameBtn.addEventListener("click", function () {
    var name = nameInput.value.trim();
    if (name && !names.includes(name)) {
        names.push(name);
        nameInput.value = "";
        updateNameList();
    }
});
spinBtn.addEventListener("click", spinWheel);
updateNameList();
