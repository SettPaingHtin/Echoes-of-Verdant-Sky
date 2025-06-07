// Scene that displays scrolling credits and then returns to the title screen
export default class CreditsScene extends Phaser.Scene {
    // Register the scene with its unique key
    constructor() {
      super('CreditsScene');
    }
  
    // Build the credits text and animate it upward before switching scenes
    create() {
      // Centered multiline credits heading and acknowledgments
      const creditsText = this.add.text(this.cameras.main.centerX, 400, 'Game by Sett Paing Htin\nAssets from Kenney\nThanks for playing!', {
        fontSize: '80px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5, 0);
  
      // Tween: scroll credits off‑screen over 10 s, then go back to the title scene
      this.tweens.add({
        targets: creditsText,
        y: -100,
        duration: 10000,
        ease: 'Linear',
        onComplete: () => {
          this.scene.start('TitleScene');
        }
      });
    }
  }
