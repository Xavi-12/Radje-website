window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById("wheel");
    var ctx = canvas.getContext("2d");
    var spinBtn = document.getElementById("spinBtn");
    var nameInput = document.getElementById("nameInput");
    var imageInput = document.getElementById("imageInput");
    var addNameForm = document.getElementById("addNameForm");
    var namesList = document.getElementById("namesList");
    var winnerDisplay = document.getElementById("winnerDisplay");
    var picker = document.querySelector(".picker");
    var participants = [];
    var isSpinning = false;
    var rotation = 0;
    var spinVelocity = 0;
    function drawWheel() {
        var radius = canvas.width / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (participants.length === 0) {
            // Teken een cirkel als radje
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#e0e0e0";
            ctx.fill();
            ctx.closePath();
            // Placeholder tekst
            ctx.save();
            ctx.font = "bold 20px sans-serif";
            ctx.fillStyle = "#888";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Voeg namen toe!", radius, radius);
            ctx.restore();
            // Teken picker
            ctx.beginPath();
            ctx.moveTo(radius - 10, 0);
            ctx.lineTo(radius + 10, 0);
            ctx.lineTo(radius, 20);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.closePath();
            return;
        }
        var sliceAngle = (2 * Math.PI) / participants.length;
        participants.forEach(function (participant, index) {
            var startAngle = index * sliceAngle + rotation;
            var endAngle = startAngle + sliceAngle;
            // Color
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, startAngle, endAngle);
            ctx.fillStyle = "hsl(".concat((index * 360) / participants.length, ", 80%, 60%)");
            ctx.fill();
            ctx.closePath();
            // Text
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(participant.name, radius - 10, 5);
            ctx.restore();
        });
        // Draw picker
        ctx.beginPath();
        ctx.moveTo(radius - 10, 0);
        ctx.lineTo(radius + 10, 0);
        ctx.lineTo(radius, 20);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }
    function spinWheel() {
        if (participants.length === 0 || isSpinning)
            return;
        isSpinning = true;
        var spinTime = 0;
        var maxSpinTime = 4000 + Math.random() * 2000;
        spinVelocity = (Math.PI * 4) + Math.random() * Math.PI * 2;
        var start = performance.now();
        function animate(time) {
            var elapsed = time - start;
            var t = elapsed / maxSpinTime;
            var easeOut = 1 - Math.pow(1 - t, 3);
            rotation += spinVelocity * (1 - easeOut) * 0.02;
            rotation %= 2 * Math.PI;
            drawWheel();
            if (t < 1) {
                requestAnimationFrame(animate);
            }
            else {
                isSpinning = false;
                pickWinner();
            }
        }
        requestAnimationFrame(animate);
    }
    function pickWinner() {
        var sliceAngle = (2 * Math.PI) / participants.length;
        var index = participants.length - Math.floor((rotation % (2 * Math.PI)) / sliceAngle) - 1;
        var winner = participants[index];
        if (!winner)
            return;
        var container = document.createElement("div");
        container.className = "winner-popup";
        var nameEl = document.createElement("h2");
        nameEl.textContent = "\uD83C\uDF89 Winnaar: ".concat(winner.name);
        var img = document.createElement("img");
        img.src = winner.image.src;
        img.style.maxWidth = "200px";
        img.style.borderRadius = "10px";
        img.style.display = "block";
        img.style.margin = "0 auto 16px auto";
        var removeBtn = document.createElement("button");
        removeBtn.textContent = "Verwijder van het rad";
        removeBtn.className = "popup-btn";
        removeBtn.onclick = function () {
            participants.splice(index, 1);
            drawWheel();
            renderList();
            renderNames();
            container.remove();
        };
        var keepBtn = document.createElement("button");
        keepBtn.textContent = "Laat op het rad";
        keepBtn.className = "popup-btn";
        keepBtn.onclick = function () { return container.remove(); };
        container.append(nameEl, img, removeBtn, keepBtn);
        // Overlay over het rad
        winnerDisplay.innerHTML = "";
        winnerDisplay.appendChild(container);
        winnerDisplay.style.display = "flex";
    }
    addNameForm.addEventListener("submit", function (e) {
        var _a;
        e.preventDefault();
        var name = nameInput.value.trim();
        var file = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!name || !file)
            return;
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                participants.push({ name: name, image: img });
                nameInput.value = "";
                imageInput.value = "";
                drawWheel();
                renderList();
                renderNames();
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
    function renderList() {
        namesList.innerHTML = "";
        participants.forEach(function (p, i) {
            var li = document.createElement("li");
            li.textContent = p.name;
            namesList.appendChild(li);
        });
    }
    function renderNames() {
        var _a;
        var previewContainer = document.getElementById("previewContainer");
        if (!previewContainer) {
            previewContainer = document.createElement("div");
            previewContainer.id = "previewContainer";
            (_a = document.querySelector(".container")) === null || _a === void 0 ? void 0 : _a.appendChild(previewContainer);
        }
        previewContainer.innerHTML = "";
        participants.forEach(function (p) {
            var entry = document.createElement("div");
            entry.className = "preview-entry";
            var img = document.createElement("img");
            img.src = p.image.src;
            img.style.width = "40px";
            img.style.height = "40px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "50%";
            var name = document.createElement("span");
            name.textContent = p.name;
            name.style.marginLeft = "8px";
            entry.appendChild(img);
            entry.appendChild(name);
            previewContainer.appendChild(entry);
        });
    }
    spinBtn.addEventListener("click", spinWheel);
    drawWheel();
});
