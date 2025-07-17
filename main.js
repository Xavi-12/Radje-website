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
    var picker = document.querySelector('.picker');
    // Mooie gouden pick boven het wiel
    function updatePicker() {
        picker.style.left = '50%';
        // Zet de pick net boven het canvas, gecentreerd
        picker.style.top = (wheel.offsetTop - 38) + 'px';
        picker.style.transform = 'translateX(-50%)';
        picker.style.width = '0';
        picker.style.height = '0';
        // Mooie gouden pick met een witte rand en een schaduw
        picker.style.borderLeft = '22px solid transparent';
        picker.style.borderRight = '22px solid transparent';
        picker.style.borderTop = '44px solid gold'; // borderTop ipv borderBottom!
        picker.style.borderBottom = 'none';
        picker.style.borderRadius = '10px';
        picker.style.boxShadow = '0 6px 18px rgba(255,215,0,0.25), 0 2px 8px rgba(0,0,0,0.12)';
        picker.style.position = 'absolute';
        picker.style.zIndex = '2';
        // Witte rand
        picker.style.outline = '3px solid white';
    }
    updatePicker();
    window.addEventListener('resize', updatePicker);
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
            // Mooie gradient slices
            var grad = ctx.createLinearGradient(centerX, centerY, centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
            grad.addColorStop(0, "hsl(".concat(i * 360 / entries.length, ", 80%, 65%)"));
            grad.addColorStop(1, "hsl(".concat(i * 360 / entries.length + 20, ", 70%, 50%)"));
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
        if (spinning || entries.length < 2)
            return;
        spinning = true;
        spinBtn.disabled = true;
        winnerDisplay.textContent = "";
        // Krachtigere draai: meer spins en random tijd
        var spins = Math.floor(Math.random() * 4) + 7; // 7-10 rondjes
        var finalIndex = Math.floor(Math.random() * entries.length);
        winnerIndex = finalIndex;
        var sliceAngle = 2 * Math.PI / entries.length;
        var finalAngle = (3 * Math.PI / 2) - (finalIndex * sliceAngle) - (sliceAngle / 2);
        var start = currentAngle;
        var end = finalAngle + spins * 2 * Math.PI;
        var duration = Math.floor(Math.random() * 1200) + 3200; // 3200-4400ms
        var startTime = null;
        function animateWheel(ts) {
            if (!startTime)
                startTime = ts;
            var elapsed = ts - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // Sterkere ease out
            var ease = 1 - Math.pow(1 - progress, 4);
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
        winnerDisplay.innerHTML = "\n        <div>\n            <strong>Winnaar: ".concat(winner.name, "</strong><br>\n            <img src=\"").concat(winner.image, "\" alt=\"Foto van ").concat(winner.name, "\" style=\"max-width:120px; border-radius:12px; margin-top:10px; box-shadow:0 4px 16px gold;\">\n        </div>\n        <div style=\"margin-top:10px;\">\n            <button class=\"removeBtn\" id=\"removeWinnerBtn\">Winnaar verwijderen</button>\n            <button class=\"removeBtn\" id=\"keepWinnerBtn\" style=\"background:#27ae60; margin-left:8px;\">Winnaar houden</button>\n        </div>\n    ");
        document.getElementById('removeWinnerBtn').onclick = function () {
            entries.splice(winnerIndex, 1);
            winnerIndex = null;
            drawWheel(currentAngle);
            winnerDisplay.textContent = "";
            renderNamesList();
        };
        document.getElementById('keepWinnerBtn').onclick = function () {
            winnerDisplay.textContent = "";
            winnerIndex = null;
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
