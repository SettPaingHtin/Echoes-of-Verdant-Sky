// Scene that appears when the player dies and offers a quick restart
export default class GameOverScene extends Phaser.Scene {
    // Register the scene with its key
    constructor() {
      super('GameOverScene');
    }
  
    // Render Game Over text, restart prompt, and handle click to reload level
    create() {
      // Bold "Game Over" title at the top
      this.add.text(this.cameras.main.centerX, 100, 'Game Over', {
        fontSize: '80px',
        fill: '#fff'
      }).setOrigin(0.5);
  
      // Instruction prompting the player to click
      this.add.text(this.cameras.main.centerX, 200, 'Click to restart...', {
        fontSize: '65px',
        fill: '#fff'
      }).setOrigin(0.5);
  
      // Single‑click listener that restarts the level
      this.input.once('pointerdown', () => {
        this.scene.start('CrumblingHollows'); // Go back to the first level
      });
    }
  }
