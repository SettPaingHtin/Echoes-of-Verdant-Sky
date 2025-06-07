// Scene that celebrates the player's success and decides where to go next
export default class CongratsScene extends Phaser.Scene {
    // Register the scene with its unique key
    constructor() {
      super('CongratsScene');
    }
  
    // Capture parameters passed in from the previous scene
    init(data) {
      this.nextScene = data.nextScene;
      this.nextMain = data.nextMain;  // <--- added
      this.health = data.health;
      this.score = data.score;
    }
  
    // Build UI text elements and a single‑click handler for navigation
    create() {
      // Main congratulatory heading
      this.add.text(this.cameras.main.centerX, 100, 'Congratulations!', {
        fontSize: '80px',
        fill: '#fff'
      }).setOrigin(0.5);
  
      // Display the player's score
      this.add.text(this.cameras.main.centerX, 200, `Score: ${this.score}`, {
        fontSize: '75px',
        fill: '#fff'
      }).setOrigin(0.5);
  
      // Prompt player to proceed
      this.add.text(this.cameras.main.centerX, 300, 'Click to continue...', {
        fontSize: '65px',
        fill: '#fff'
      }).setOrigin(0.5);
  
      // On first click, branch to URL, next scene, or fallback
      this.input.once('pointerdown', () => {
        if (this.nextMain) {
          // Load a new main HTML page → start a fresh Phaser game instance
          window.location.href = this.nextMain;
        } else if (this.nextScene) {
          // Stay in the same game instance and transition to the specified scene
          this.scene.start(this.nextScene, {
            health: this.health,
            score: this.score
          });
        } else {
          // No next target supplied → go to a generic Game Over screen
          this.scene.start('GameOverScene');
        }
      });
    }
  }
