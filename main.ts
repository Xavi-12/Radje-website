window.addEventListener('DOMContentLoaded', () => {
interface Player {
    name: string;
    color: string;
    imageUrl: string;
}

class SpinningWheel {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private nameInput: HTMLInputElement;
    private imageInput: HTMLInputElement;
    private imageBtn: HTMLButtonElement;
    private addBtn: HTMLButtonElement;
    private spinBtn: HTMLButtonElement;
    private playersList: HTMLElement;
    private winnerPopup: HTMLElement;
    private winnerImage: HTMLImageElement;
    private winnerName: HTMLElement;
    private removeWinnerBtn: HTMLButtonElement;
    private keepWinnerBtn: HTMLButtonElement;
    
    private players: Player[] = [];
    private currentAngle: number = 0;
    private isSpinning: boolean = false;
    private currentWinner: Player | null = null;

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.drawWheel();
    }

    private initializeElements(): void {
        this.canvas = document.getElementById('wheel') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.nameInput = document.getElementById('nameInput') as HTMLInputElement;
        this.imageInput = document.getElementById('imageInput') as HTMLInputElement;
        this.imageBtn = document.getElementById('imageBtn') as HTMLButtonElement;
        this.addBtn = document.getElementById('addBtn') as HTMLButtonElement;
        this.spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
        this.playersList = document.getElementById('playersList')!;
        this.winnerPopup = document.getElementById('winnerPopup')!;
        this.winnerImage = document.getElementById('winnerImage') as HTMLImageElement;
        this.winnerName = document.getElementById('winnerName')!;
        this.removeWinnerBtn = document.getElementById('removeWinnerBtn') as HTMLButtonElement;
        this.keepWinnerBtn = document.getElementById('keepWinnerBtn') as HTMLButtonElement;
    }

    private setupEventListeners(): void {
        this.imageBtn.addEventListener('click', () => this.imageInput.click());
        this.addBtn.addEventListener('click', () => this.addPlayer());
        this.spinBtn.addEventListener('click', () => this.spinWheel());
        this.removeWinnerBtn.addEventListener('click', () => this.removeWinner());
        this.keepWinnerBtn.addEventListener('click', () => this.keepWinner());
        
        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
    }

    private getRandomColor(): string {
        const colors = [
            '#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
            '#2196F3', '#03DAC6', '#00BCD4', '#009688', '#4CAF50',
            '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
            '#FF5722', '#F44336', '#E91E63', '#9C27B0', '#673AB7'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private addPlayer(): void {
        const name = this.nameInput.value.trim();
        const file = this.imageInput.files?.[0];

        if (!name || !file) {
            alert('Voer een naam in en selecteer een afbeelding!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const newPlayer: Player = {
                name: name,
                color: this.getRandomColor(),
                imageUrl: e.target?.result as string
            };

            this.players.push(newPlayer);
            this.nameInput.value = '';
            this.imageInput.value = '';
            this.updatePlayersList();
            this.drawWheel();
            this.updateSpinButton();
        };
        reader.readAsDataURL(file);
    }

    private removePlayer(index: number): void {
        this.players.splice(index, 1);
        this.updatePlayersList();
        this.drawWheel();
        this.updateSpinButton();
    }

    private updatePlayersList(): void {
        this.playersList.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.style.borderLeftColor = player.color;
            
            playerItem.innerHTML = `
                <img src="${player.imageUrl}" alt="${player.name}" class="player-avatar">
                <span class="player-name">${player.name}</span>
                <button class="remove-player" onclick="wheel.removePlayerByIndex(${index})">×</button>
            `;
            
            this.playersList.appendChild(playerItem);
        });
    }

    private updateSpinButton(): void {
        this.spinBtn.disabled = this.players.length < 2;
    }

    private drawWheel(): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

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

        const anglePerPlayer = (2 * Math.PI) / this.players.length;

        this.players.forEach((player, index) => {
            const startAngle = (anglePerPlayer * index) + this.currentAngle;
            const endAngle = startAngle + anglePerPlayer;

            // Draw sector
            this.ctx.beginPath();
            this.ctx.fillStyle = player.color;
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + anglePerPlayer / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(player.name, radius - 20, 5);
            this.ctx.restore();
        });
    }

    private spinWheel(): void {
        if (this.isSpinning || this.players.length < 2) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;

        const spinAngle = Math.random() * 360 + 360 * 5; // 5+ rotations
        const duration = 4000;
        const startTime = performance.now();
        const initialAngle = this.currentAngle;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.currentAngle = initialAngle + (eased * spinAngle * Math.PI / 180);
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.spinBtn.disabled = false;
                this.detectWinner();
            }
        };

        requestAnimationFrame(animate);
    }

    private detectWinner(): void {
        // Get the color directly under the pointer (top center of canvas)
        const centerX = this.canvas.width / 2;
        const pointerY = 40; // Further down, at the tip of the pointer
        
        const imageData = this.ctx.getImageData(centerX, pointerY, 1, 1);
        const [r, g, b] = imageData.data;
        const detectedColor = this.rgbToHex(r, g, b);
        
        // Find the player with matching color
        this.currentWinner = this.players.find(player => player.color === detectedColor) || null;
        
        if (this.currentWinner) {
            this.showWinnerPopup();
        }
    }

    private showWinnerPopup(): void {
        if (!this.currentWinner) return;

        this.winnerImage.src = this.currentWinner.imageUrl;
        this.winnerName.textContent = `🎉 ${this.currentWinner.name} Wint! 🎉`;
        this.winnerPopup.classList.add('show');
    }

    private removeWinner(): void {
        if (!this.currentWinner) return;

        const index = this.players.indexOf(this.currentWinner);
        if (index > -1) {
            this.removePlayer(index);
        }
        this.hideWinnerPopup();
    }

    private keepWinner(): void {
        this.hideWinnerPopup();
    }

    private hideWinnerPopup(): void {
        this.winnerPopup.classList.remove('show');
        this.currentWinner = null;
    }

    private rgbToHex(r: number, g: number, b: number): string {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Public method for removing players (called from HTML)
    public removePlayerByIndex(index: number): void {
        this.removePlayer(index);
    }
}

// Initialize the wheel when the page loads
const wheel = new SpinningWheel();

// Make wheel globally accessible for HTML onclick events
(window as any).wheel = wheel;
});
