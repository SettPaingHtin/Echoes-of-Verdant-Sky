// /scenes/Load.js

export default class Load extends Phaser.Scene {
    constructor() {
        super('Load');
    }

    preload() {
        // Load everything needed for all scenes
        this.load.tilemapTiledJSON('breezyMap', 'assets/tilemaps/Breezy Spires.json');
        this.load.tilemapTiledJSON('crumblingMap', 'assets/tilemaps/Crumbling Hollows.json');

        this.load.image('Background', 'assets/tilesets/tilemap-backgrounds_packed.png');
        this.load.image('Construction', 'assets/tilesets/tilemap_packed2.png');
        this.load.image('Main', 'assets/tilesets/tilemap_packed.png');
        this.load.image('Rocks', 'assets/tilesets/rock_packed.png');
        this.load.image('coin1', 'assets/sprites/coin1.png');
        this.load.image('coin2', 'assets/sprites/coin2.png');
        this.load.image('heart', 'assets/sprites/heart.png');
        this.load.image('shrine', 'assets/sprites/shrine.png');
        this.load.image('playerExtra1', 'assets/sprites/playerExtra1.png');
        this.load.image('playerExtra2', 'assets/sprites/playerExtra2.png');
    }

    create() {
        // After load go to first level
        this.scene.start('BreezySpires', { score: 0 });
    }
}
