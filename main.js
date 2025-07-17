window.addEventListener('DOMContentLoaded', function () {
    var participants = [];
    var wheel = document.getElementById('wheel');
    var ctx = wheel.getContext('2d');
    var spinBtn = document.getElementById('spin-btn');
    // Helper: random bright color
    function brightColor() {
        var hue = Math.floor(Math.random() * 360);
        return "hsl(".concat(hue, ", 90%, 55%)");
    }
    // Draw wheel (rotation in radians)
    function drawWheel(rotation) {
        if (rotation === void 0) { rotation = 0; }
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        var n = participants.length;
        var centerX = wheel.width / 2;
        var centerY = wheel.height / 2;
        var radius = wheel.width / 2 - 10;
        var startAngle = rotation;
        for (var i = 0; i < n; i++) {
            var sliceAngle = (2 * Math.PI) / n;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = participants[i].color;
            ctx.fill();
            ctx.stroke();
            // Draw name
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = "right";
            ctx.font = "18px Arial";
            ctx.fillStyle = "#fff";
            ctx.fillText(participants[i].name, radius - 20, 0);
            ctx.restore();
            startAngle += sliceAngle;
        }
    }
    // Draw pin above the wheel (fixed position)
    function drawPin() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(wheel.width / 2, 20);
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, -30);
        ctx.lineTo(15, -30);
        ctx.closePath();
        ctx.fillStyle = "#e74c3c";
        ctx.fill();
        ctx.restore();
    }
    // Spin logic
    var spinning = false;
    var angle = 0;
    var winnerIndex = 0;
    var animationFrame;
    function spinWheel() {
        if (participants.length === 0 || spinning)
            return;
        spinning = true;
        var extraSpins = Math.floor(Math.random() * 3) + 5; // 5-7 rounds
        var randomOffset = Math.random() * 2 * Math.PI;
        var finalAngle = extraSpins * 2 * Math.PI + randomOffset;
        var duration = 3000; // ms
        var start = performance.now();
        var startAngle = angle;
        function animate(now) {
            var elapsed = now - start;
            if (elapsed < duration) {
                // Ease out
                var t = elapsed / duration;
                angle = startAngle + (finalAngle - startAngle) * easeOutCubic(t);
                render();
                animationFrame = requestAnimationFrame(animate);
            }
            else {
                angle = (startAngle + finalAngle) % (2 * Math.PI);
                spinning = false;
                render();
                showWinnerPopup();
            }
        }
        animationFrame = requestAnimationFrame(animate);
    }
    // Easing function for smooth animation
    function easeOutCubic(t) {
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
        var n = participants.length;
        var sliceAngle = (2 * Math.PI) / n;
        var normalized = (3 * Math.PI / 2 - angle) % (2 * Math.PI);
        if (normalized < 0)
            normalized += 2 * Math.PI;
        return Math.floor(normalized / sliceAngle) % n;
    }
    // Winner popup with remove button
    function showWinnerPopup() {
        winnerIndex = getWinnerIndex();
        var winner = participants[winnerIndex];
        var popup = document.createElement('div');
        popup.className = 'winner-popup';
        popup.innerHTML = "\n        <div class=\"winner-content\">\n            <img src=\"".concat(winner.photo || '', "\" style=\"width:100px;height:100px;border-radius:50%;background:").concat(winner.photo ? 'none' : winner.color, ";object-fit:cover;\">\n            <h2>").concat(winner.name, "</h2>\n            <button id=\"remove-winner-btn\">Verwijder winnaar van het rad</button>\n        </div>\n    ");
        document.body.appendChild(popup);
        // Verwijder popup na 5 seconden automatisch
        var autoClose = setTimeout(function () { return popup.remove(); }, 5000);
        // Verwijder winnaar knop
        var removeBtn = document.getElementById('remove-winner-btn');
        removeBtn === null || removeBtn === void 0 ? void 0 : removeBtn.addEventListener('click', function () {
            participants.splice(winnerIndex, 1);
            render();
            clearTimeout(autoClose);
            popup.remove();
        });
    }
    // Add participant UI
    var form = document.querySelector('.add-form');
    var nameInput = form.querySelector('#name-input');
    var photoInput = form.querySelector('#photo-input');
    var previewImg = form.querySelector('#preview-img');
    photoInput.addEventListener('change', function () {
        var _a;
        var file = (_a = photoInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var _a;
                previewImg.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                previewImg.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
        else {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
    });
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = nameInput.value.trim();
        var photo = previewImg.src || '';
        if (!name)
            return;
        participants.push({
            name: name,
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
