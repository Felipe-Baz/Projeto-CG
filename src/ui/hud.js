export class HUD {
    constructor() {
        // Elementos do HUD
        this.scoreElement = document.getElementById('hud-score-value');
        this.livesElement = document.getElementById('hud-lives-value');
        
        // Valores iniciais
        this.score = 0;
        this.lives = 3;
        
        // Inicializa display
        this.updateScore(0);
        this.updateLives(3);
    }
    
    updateScore(newScore) {
        this.score = newScore;
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }
    
    addScore(points) {
        this.updateScore(this.score + points);
    }
    
    updateLives(newLives) {
        this.lives = newLives;
        if (this.livesElement) {
            this.livesElement.textContent = this.lives;
        }
    }
    
    loseLife() {
        this.updateLives(Math.max(0, this.lives - 1));
    }
    
    gainLife() {
        this.updateLives(this.lives + 1);
    }
    
    getScore() {
        return this.score;
    }
    
    getLives() {
        return this.lives;
    }
    
    isGameOver() {
        return this.lives <= 0;
    }
}
