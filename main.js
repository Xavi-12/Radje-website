window.addEventListener('DOMContentLoaded', function () {
    var entries = [];
    var spinning = false;
    var currentAngle = 0;
    var winnerIndex = null;
    var wheel = document.getElementById('wheel');
    var ctx = wheel.getContext('2d');
    var spinBtn = document.getElementById('spinBtn');
    var winnerDisplay = document.getElementById('winnerDisplay');
    var addNameForm = document.getElementById('addNameForm');
    var nameInput = document.getElementById('nameInput');
    var imageInput = document.getElementById('imageInput');
    var namesList = document.getElementById('namesList');
    function drawWheel(angle) {
        if (angle === void 0) { angle = 0; }
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        var radius = wheel.width / 2;
        var centerX = wheel.width / 2;
        var centerY = wheel.height / 2;
        var sliceAngle = 2 * Math.PI / entries.length;
        for (var i = 0; i < entries.length; i++) {
            var startAngle = angle + i * sliceAngle;
            var endAngle = startAngle + sliceAngle;
            // Colorful slices
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = "hsl(".concat(i * 360 / entries.length, ", 70%, 60%)");
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
        if (spinning || entries.length < 2)
            return;
        spinning = true;
        spinBtn.disabled = true;
        winnerDisplay.textContent = "";
        var spins = Math.floor(Math.random() * 3) + 5; // 5-7 spins
        var finalIndex = Math.floor(Math.random() * entries.length);
        winnerIndex = finalIndex;
        var sliceAngle = 2 * Math.PI / entries.length;
        var finalAngle = (3 * Math.PI / 2) - (finalIndex * sliceAngle) - (sliceAngle / 2);
        var start = currentAngle;
        var end = finalAngle + spins * 2 * Math.PI;
        var duration = 4000;
        var startTime = null;
        function animateWheel(ts) {
            if (!startTime)
                startTime = ts;
            var elapsed = ts - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
            currentAngle = start + (end - start) * ease;
            drawWheel(currentAngle);
            if (progress < 1) {
                requestAnimationFrame(animateWheel);
            }
            else {
                spinning = false;
                spinBtn.disabled = false;
                showWinner();
            }
        }
        requestAnimationFrame(animateWheel);
    }
    function showWinner() {
        if (winnerIndex === null)
            return;
        var winner = entries[winnerIndex];
        winnerDisplay.innerHTML = "\n        <div>\n            <strong>Winnaar: ".concat(winner.name, "</strong><br>\n            <img src=\"").concat(winner.image, "\" alt=\"Foto van ").concat(winner.name, "\" style=\"max-width:120px; border-radius:12px; margin-top:10px;\">\n        </div>\n        <button class=\"removeBtn\" id=\"removeWinnerBtn\">Winnaar verwijderen</button>\n    ");
        document.getElementById('removeWinnerBtn').onclick = function () {
            entries.splice(winnerIndex, 1);
            winnerIndex = null;
            drawWheel(currentAngle);
            winnerDisplay.textContent = "";
            renderNamesList();
        };
    }
    function renderNamesList() {
        namesList.innerHTML = "";
        entries.forEach(function (entry, idx) {
            var li = document.createElement('li');
            li.innerHTML = "\n            <img src=\"".concat(entry.image, "\" alt=\"Foto van ").concat(entry.name, "\" style=\"width:32px; height:32px; border-radius:50%; object-fit:cover;\">\n            ").concat(entry.name, "\n            <button class=\"removeBtn\" data-idx=\"").concat(idx, "\">Verwijder</button>\n        ");
            li.querySelector('.removeBtn').onclick = function () {
                entries.splice(idx, 1);
                drawWheel(currentAngle);
                renderNamesList();
            };
            namesList.appendChild(li);
        });
    }
    addNameForm.onsubmit = function (e) {
        var _a;
        e.preventDefault();
        var name = nameInput.value.trim();
        var file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!name || !file)
            return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            entries.push({ name: name, image: ev.target.result });
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
