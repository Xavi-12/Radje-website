window.addEventListener('DOMContentLoaded', function () {
    // HTML-elementen ophalen
    var form = document.getElementById('player-form');
    var nameInput = document.getElementById('name');
    var imageInput = document.getElementById('image');
    var canvas = document.getElementById('wheel');
    var spinButton = document.getElementById('spin-btn');
    var winnerPopup = document.getElementById('winner-popup');
    var winnerName = document.getElementById('winner-name');
    var winnerImage = document.getElementById('winner-image');
    var closePopupBtn = document.getElementById('close-popup');
    var ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
    var players = [];
    var rotation = 0;
    var isSpinning = false;
    // Kleurengenerator
    function getColor(index) {
        var hue = index * (360 / players.length);
        return "hsl(".concat(hue, ", 70%, 60%)");
    }
    // Rad tekenen
    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var radius = canvas.width / 2;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var anglePerSlice = (2 * Math.PI) / players.length;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        players.forEach(function (player, i) {
            var startAngle = i * anglePerSlice;
            var endAngle = startAngle + anglePerSlice;
            // Slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.fillStyle = getColor(i);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            // Naam
            ctx.save();
            ctx.rotate(startAngle + anglePerSlice / 2);
            ctx.translate(radius * 0.65, 0);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#000';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, 0, 0);
            ctx.restore();
        });
        ctx.restore();
        drawPointer();
    }
    // Pointer tekenen (bovenkant)
    function drawPointer() {
        var size = 20;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - size / 2, 10);
        ctx.lineTo(canvas.width / 2 + size / 2, 10);
        ctx.lineTo(canvas.width / 2, 30);
        ctx.fillStyle = '#000';
        ctx.fill();
    }
    // Winnaar bepalen op basis van rotatie
    function getWinner() {
        var anglePerSlice = 2 * Math.PI / players.length;
        var normalizedRotation = (2 * Math.PI - (rotation % (2 * Math.PI))) % (2 * Math.PI);
        var index = Math.floor(normalizedRotation / anglePerSlice);
        return players[index];
    }
    // Spin-animatie
    function spinWheel() {
        if (isSpinning || players.length === 0)
            return;
        isSpinning = true;
        var extraRotations = 5 * 2 * Math.PI;
        var randomSlice = Math.floor(Math.random() * players.length);
        var anglePerSlice = 2 * Math.PI / players.length;
        var targetRotation = randomSlice * anglePerSlice;
        var finalRotation = extraRotations + targetRotation;
        var duration = 4000;
        var start = performance.now();
        var initialRotation = rotation;
        function animate(time) {
            var elapsed = time - start;
            var progress = Math.min(elapsed / duration, 1);
            var easeOut = 1 - Math.pow(1 - progress, 3);
            rotation = initialRotation + easeOut * (finalRotation - initialRotation);
            drawWheel();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
                isSpinning = false;
                var winner = getWinner();
                showWinner(winner);
            }
        }
        requestAnimationFrame(animate);
    }
    // Winnaar-popup tonen
    function showWinner(player) {
        winnerName.textContent = player.name;
        winnerImage.src = player.image;
        winnerPopup.classList.add('visible');
    }
    // Events
    form.addEventListener('submit', function (e) {
        var _a;
        e.preventDefault();
        var name = nameInput.value.trim();
        var file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!name || !file)
            return;
        var reader = new FileReader();
        reader.onload = function () {
            var imageBase64 = reader.result;
            players.push({ name: name, image: imageBase64 });
            nameInput.value = '';
            imageInput.value = '';
            drawWheel();
        };
        reader.readAsDataURL(file);
    });
    spinButton.addEventListener('click', spinWheel);
    closePopupBtn.addEventListener('click', function () {
        winnerPopup.classList.remove('visible');
    });
    // Eerste keer tekenen (leeg rad)
    drawWheel();
});
