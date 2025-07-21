window.addEventListener('DOMContentLoaded', function () {
    var SpinningWheel = /** @class */ (function () {
        function SpinningWheel() {
            this.players = [];
            this.currentAngle = 0;
            this.isSpinning = false;
            this.currentWinner = null;
            this.initializeElements();
            this.setupEventListeners();
            this.drawWheel();
        }
        SpinningWheel.prototype.initializeElements = function () {
            this.canvas = document.getElementById('wheel');
            this.ctx = this.canvas.getContext('2d');
            this.nameInput = document.getElementById('nameInput');
            this.imageInput = document.getElementById('imageInput');
            this.imageBtn = document.getElementById('imageBtn');
            this.addBtn = document.getElementById('addBtn');
            this.spinBtn = document.getElementById('spinBtn');
            this.playersList = document.getElementById('playersList');
            this.winnerPopup = document.getElementById('winnerPopup');
            this.winnerImage = document.getElementById('winnerImage');
            this.winnerName = document.getElementById('winnerName');
            this.removeWinnerBtn = document.getElementById('removeWinnerBtn');
            this.keepWinnerBtn = document.getElementById('keepWinnerBtn');
        };
        SpinningWheel.prototype.setupEventListeners = function () {
            var _this = this;
            this.imageBtn.addEventListener('click', function () { return _this.imageInput.click(); });
            this.addBtn.addEventListener('click', function () { return _this.addPlayer(); });
            this.spinBtn.addEventListener('click', function () { return _this.spinWheel(); });
            this.removeWinnerBtn.addEventListener('click', function () { return _this.removeWinner(); });
            this.keepWinnerBtn.addEventListener('click', function () { return _this.keepWinner(); });
            this.nameInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter')
                    _this.addPlayer();
            });
        };
        SpinningWheel.prototype.getRandomColor = function () {
            var colors = [
                '#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
                '#2196F3', '#03DAC6', '#00BCD4', '#009688', '#4CAF50',
                '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
                '#FF5722', '#F44336', '#E91E63', '#9C27B0', '#673AB7'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        };
        SpinningWheel.prototype.addPlayer = function () {
            var _this = this;
            var _a;
            var name = this.nameInput.value.trim();
            var file = (_a = this.imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!name || !file) {
                alert('Voer een naam in en selecteer een afbeelding!');
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var _a;
                var newPlayer = {
                    name: name,
                    color: _this.getRandomColor(),
                    imageUrl: (_a = e.target) === null || _a === void 0 ? void 0 : _a.result
                };
                _this.players.push(newPlayer);
                _this.nameInput.value = '';
                _this.imageInput.value = '';
                _this.updatePlayersList();
                _this.drawWheel();
                _this.updateSpinButton();
            };
            reader.readAsDataURL(file);
        };
        SpinningWheel.prototype.removePlayer = function (index) {
            this.players.splice(index, 1);
            this.updatePlayersList();
            this.drawWheel();
            this.updateSpinButton();
        };
        SpinningWheel.prototype.updatePlayersList = function () {
            var _this = this;
            this.playersList.innerHTML = '';
            this.players.forEach(function (player, index) {
                var playerItem = document.createElement('div');
                playerItem.className = 'player-item';
                playerItem.style.borderLeftColor = player.color;
                playerItem.innerHTML = "\n                <img src=\"".concat(player.imageUrl, "\" alt=\"").concat(player.name, "\" class=\"player-avatar\">\n                <span class=\"player-name\">").concat(player.name, "</span>\n                <button class=\"remove-player\" onclick=\"wheel.removePlayerByIndex(").concat(index, ")\">\u00D7</button>\n            ");
                _this.playersList.appendChild(playerItem);
            });
        };
        SpinningWheel.prototype.updateSpinButton = function () {
            this.spinBtn.disabled = this.players.length < 2;
        };
        SpinningWheel.prototype.drawWheel = function () {
            var _this = this;
            var centerX = this.canvas.width / 2;
            var centerY = this.canvas.height / 2;
            var radius = Math.min(centerX, centerY) - 10;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.players.length === 0) {
                this.ctx.fillStyle = '#f8f9fa';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.fillStyle = '#666';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Voeg spelers toe!', centerX, centerY);
                return;
            }
            var anglePerPlayer = (2 * Math.PI) / this.players.length;
            this.players.forEach(function (player, index) {
                var startAngle = (anglePerPlayer * index) + _this.currentAngle;
                var endAngle = startAngle + anglePerPlayer;
                // Draw sector
                _this.ctx.beginPath();
                _this.ctx.fillStyle = player.color;
                _this.ctx.moveTo(centerX, centerY);
                _this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                _this.ctx.closePath();
                _this.ctx.fill();
                // Draw border
                _this.ctx.strokeStyle = '#fff';
                _this.ctx.lineWidth = 3;
                _this.ctx.stroke();
                // Draw text
                _this.ctx.save();
                _this.ctx.translate(centerX, centerY);
                _this.ctx.rotate(startAngle + anglePerPlayer / 2);
                _this.ctx.textAlign = 'right';
                _this.ctx.fillStyle = '#000';
                _this.ctx.font = 'bold 16px Arial';
                _this.ctx.fillText(player.name, radius - 20, 5);
                _this.ctx.restore();
            });
        };
        SpinningWheel.prototype.spinWheel = function () {
            var _this = this;
            if (this.isSpinning || this.players.length < 2)
                return;
            this.isSpinning = true;
            this.spinBtn.disabled = true;
            var spinAngle = Math.random() * 360 + 360 * 5; // 5+ rotations
            var duration = 4000;
            var startTime = performance.now();
            var initialAngle = this.currentAngle;
            var animate = function (currentTime) {
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                // Easing function for smooth deceleration
                var eased = 1 - Math.pow(1 - progress, 3);
                _this.currentAngle = initialAngle + (eased * spinAngle * Math.PI / 180);
                _this.drawWheel();
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    _this.isSpinning = false;
                    _this.spinBtn.disabled = false;
                    _this.detectWinner();
                }
            };
            requestAnimationFrame(animate);
        };
        SpinningWheel.prototype.detectWinner = function () {
            // Get pixel color at pointer position
            var pointerX = this.canvas.width / 2;
            var pointerY = 20;
            var pixel = this.ctx.getImageData(pointerX, pointerY, 1, 1).data;
            var rgb = "#".concat(this.toHex(pixel[0])).concat(this.toHex(pixel[1])).concat(this.toHex(pixel[2])).toUpperCase();
            // Find winner by matching color (ES5 compatible)
            var winner = null;
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].color.toUpperCase() === rgb) {
                    winner = this.players[i];
                    break;
                }
            }
            if (winner) {
                this.currentWinner = winner;
                this.showWinnerPopup();
            }
            else {
                console.log("Geen winnaar gedetecteerd.");
            }
        };
        SpinningWheel.prototype.showWinnerPopup = function () {
            if (!this.currentWinner)
                return;
            this.winnerImage.src = this.currentWinner.imageUrl;
            this.winnerName.textContent = "\uD83C\uDF89 ".concat(this.currentWinner.name, " Wint! \uD83C\uDF89");
            this.winnerPopup.classList.add('show');
        };
        SpinningWheel.prototype.removeWinner = function () {
            if (!this.currentWinner)
                return;
            var index = this.players.indexOf(this.currentWinner);
            if (index > -1) {
                this.removePlayer(index);
            }
            this.hideWinnerPopup();
        };
        SpinningWheel.prototype.keepWinner = function () {
            this.hideWinnerPopup();
        };
        SpinningWheel.prototype.hideWinnerPopup = function () {
            this.winnerPopup.classList.remove('show');
            this.currentWinner = null;
        };
        SpinningWheel.prototype.toHex = function (value) {
            var hex = value.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        // Public method for removing players (called from HTML)
        SpinningWheel.prototype.removePlayerByIndex = function (index) {
            this.removePlayer(index);
        };
        return SpinningWheel;
    }());
    // Initialize the wheel when the page loads
    var wheel = new SpinningWheel();
    // Make wheel globally accessible for HTML onclick events
    window.wheel = wheel;
});
