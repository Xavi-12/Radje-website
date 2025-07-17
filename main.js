var canvas = document.getElementById('wheel');
var ctx = canvas.getContext('2d');
var spinBtn = document.getElementById('spinBtn');
var namesForm = document.getElementById('namesForm');
var namesInput = document.getElementById('namesInput');
var winnerPopup = document.getElementById('winnerPopup');
var winnerNameElem = document.getElementById('winnerName');
var closePopupBtn = document.getElementById('closePopupBtn');
var nameInput = document.getElementById('singleNameInput');
var photoInput = document.getElementById('photoInput');
var addNameBtn = document.getElementById('addNameBtn');
var namesListElem = document.getElementById('namesList');
var photosListElem = document.getElementById('photosList');
var names = [];
var startAngle = 0;
var arc = 0;
var spinning = false;
var finalAngle = 0;
var FULL_ROTATION = 2 * Math.PI;
var persons = [];
function updateNamesList() {
    namesListElem.innerHTML = '';
    persons.forEach(function (person, idx) {
        var li = document.createElement('li');
        li.textContent = person.name;
        namesListElem.appendChild(li);
    });
}
function updatePhotosList() {
    photosListElem.innerHTML = '';
    persons.forEach(function (person) {
        if (person.photoUrl) {
            var img = document.createElement('img');
            img.src = person.photoUrl;
            img.alt = person.name;
            img.style.width = '64px';
            img.style.height = '64px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            img.style.margin = '0 8px';
            photosListElem.appendChild(img);
        }
    });
}
function drawWheel() {
    var width = canvas.width;
    var height = canvas.height;
    var centerX = width / 2;
    var centerY = height / 2;
    var outsideRadius = Math.min(centerX, centerY) - 10;
    var textRadius = outsideRadius - 40;
    var insideRadius = 50;
    ctx.clearRect(0, 0, width, height);
    if (persons.length === 0)
        return;
    arc = FULL_ROTATION / persons.length;
    for (var i = 0; i < persons.length; i++) {
        var angle = startAngle + i * arc;
        ctx.fillStyle = "hsl(".concat((i * 360) / persons.length, ", 70%, 70%)");
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.translate(centerX + Math.cos(angle + arc / 2) * textRadius, centerY + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px Arial';
        var text = persons[i].name.length > 12 ? persons[i].name.slice(0, 12) + '…' : persons[i].name;
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(centerX, centerY, insideRadius, 0, FULL_ROTATION);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
}
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
function spin() {
    if (spinning)
        return;
    spinning = true;
    spinBtn.disabled = true;
    var rotations = Math.random() * 3 + 3;
    var randomAngle = Math.random() * FULL_ROTATION;
    var totalRotation = rotations * FULL_ROTATION + randomAngle;
    var duration = 5000;
    var startTime = performance.now();
    function animate(time) {
        var elapsed = time - startTime;
        var t = Math.min(elapsed / duration, 1);
        var easedT = easeOutCubic(t);
        startAngle = (totalRotation * easedT) % FULL_ROTATION;
        finalAngle = startAngle;
        drawWheel();
        if (t < 1) {
            requestAnimationFrame(animate);
        }
        else {
            spinning = false;
            spinBtn.disabled = false;
            determineWinner();
        }
    }
    requestAnimationFrame(animate);
}
function determineWinner() {
    var winnerIndex = Math.floor((finalAngle % FULL_ROTATION) / arc);
    winnerNameElem.textContent = persons[winnerIndex].name;
    winnerPopup.classList.remove('hidden');
}
namesForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var inputText = namesInput.value.trim();
    if (!inputText) {
        alert('Voer minstens 1 naam in.');
        return;
    }
    names = inputText.split('\n').map(function (n) { return n.trim(); }).filter(function (n) { return n.length > 0; });
    if (names.length < 2) {
        alert('Voer minstens 2 namen in.');
        return;
    }
    startAngle = 0;
    drawWheel();
    spinBtn.disabled = false;
});
spinBtn.addEventListener('click', spin);
closePopupBtn.addEventListener('click', function () {
    winnerPopup.classList.add('hidden');
});
addNameBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    if (!name) {
        alert('Voer een naam in.');
        return;
    }
    var photoUrl;
    if (photoInput.files && photoInput.files[0]) {
        var file = photoInput.files[0];
        photoUrl = URL.createObjectURL(file);
    }
    persons.push({ name: name, photoUrl: photoUrl });
    nameInput.value = '';
    photoInput.value = '';
    updateNamesList();
    updatePhotosList();
    drawWheel();
    spinBtn.disabled = persons.length < 2;
});
window.onload = function () {
    spinBtn.disabled = true;
};
