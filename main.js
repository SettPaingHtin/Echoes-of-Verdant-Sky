// Entry point: import all scenes needed by the game
import TitleScene from './scenes/TitleScene.js';
import Load from './scenes/Load.js';
import BreezySpires from './scenes/BreezySpires.js';
import CrumblingHollows from './scenes/CrumblingHollows.js';
import CongratsScene from './scenes/CongratsScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import CreditsScene from './scenes/CreditsScene.js';

// Global Phaser configuration object describing renderer, physics, scaling, FPS, and scenes
const config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    // Canvas size definition
    width: 2560,
    height: 1440,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scene: [
        TitleScene,
        Load,
        BreezySpires,
        CrumblingHollows,
        CongratsScene,
        GameOverScene,
        CreditsScene
    ]
};

// Launch a new Phaser.Game instance using the configuration above
const game = new Phaser.Game(config);
