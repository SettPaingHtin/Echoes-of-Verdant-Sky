// /scenes/TitleScene.js
export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    preload() {
        this.load.image('background', 'assets/tilesets/tilemap-backgrounds_packed.png');
        this.load.image('coin1', 'assets/sprites/coin1.png'); 
        this.load.audio('bgm', 'assets/audio/time_for_adventure.mp3');
    }

    create() {
        // Background image
        this.add.image(1000, 700, 'background')
            .setScrollFactor(0)
            .setScale(20)
            .setDepth(0);

        // Background music
        this.bgm = this.sound.add('bgm', {
            volume: 0.5,
            loop: true
        });
        this.bgm.play();

        // Title text
        this.add.text(100, 120, 'Echoes of Verdant Sky', {
            fontSize: '80px',
            color: '#000000',
            fontFamily: 'Arial'
        }).setDepth(1);

        // Start text
        this.add.text(100, 200, 'Press SPACE to Start', {
            fontSize: '65px',
            color: '#000000'
        }).setDepth(1);

        // Floating sprites group
        this.floatingGroup = this.add.group();

        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(100, 3000);
            const y = Phaser.Math.Between(100, 1500);
            const sprite = this.add.sprite(x, y, 'coin1')
                .setScale(10)
                .setAlpha(0.8)
                .setDepth(0.5);

            this.floatingGroup.add(sprite);

            // Give each sprite some floating tween
            this.tweens.add({
                targets: sprite,
                y: y + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Input to start game
        this.input.keyboard.once('keydown-SPACE', () => {
            this.bgm.stop(); // Stop the music when leaving the title screen
            this.scene.start('BreezySpires', { health: 3 });
        });
    }
}
