export class GameOverScreen {
    constructor() {
        this.isActive = false;
        this.onRestartCallback = null;
        this.createScreen();
    }

    createScreen() {
        // Create game over container
        this.screen = document.createElement('div');
        this.screen.className = 'game-over-screen';
        this.screen.id = 'game-over-screen';

        this.screen.innerHTML = `
            <div class="game-over-content">
                <h1 class="game-over-title">GAME OVER</h1>
                <div class="game-over-stats">
                    <div>
                        <span class="stat-label">FINAL SCORE:</span>
                        <span class="stat-value score-highlight" id="final-score">0</span>
                    </div>
                    <div style="margin-top: 15px;">
                        <span class="stat-label">LEVEL REACHED:</span>
                        <span class="stat-value" id="final-level">1</span>
                    </div>
                    <div style="margin-top: 10px; font-size: 18px; color: #888;">
                        <span id="survival-time">Survived for 0s</span>
                    </div>
                </div>
                <div class="game-over-buttons">
                    <button class="game-over-button restart-button" id="restart-button">
                        ↻ Restart
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.screen);

        // Add event listeners
        this.restartButton = document.getElementById('restart-button');
        this.restartButton.addEventListener('click', () => this.restart());

        // Allow restart with Enter key
        document.addEventListener('keydown', (e) => {
            if (this.isActive && e.key === 'Enter') {
                this.restart();
            }
        });
    }

    show(finalScore = 0, level = 1, gameTime = 0) {
        this.isActive = true;
        
        // Update score
        document.getElementById('final-score').textContent = finalScore;
        
        // Update level
        document.getElementById('final-level').textContent = level;
        
        // Update survival time
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        const timeText = minutes > 0 
            ? `Survived for ${minutes}m ${seconds}s` 
            : `Survived for ${seconds}s`;
        document.getElementById('survival-time').textContent = timeText;

        // Show screen
        this.screen.classList.add('active');
    }

    hide() {
        this.isActive = false;
        this.screen.classList.remove('active');
    }

    restart() {
        this.hide();
        if (this.onRestartCallback) {
            this.onRestartCallback();
        }
    }

    onRestart(callback) {
        this.onRestartCallback = callback;
    }

    isGameOverActive() {
        return this.isActive;
    }
}
