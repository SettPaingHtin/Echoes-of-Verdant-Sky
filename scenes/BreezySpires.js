// Phaser scene class controlling the Breezy Spires level
export default class BreezySpires extends Phaser.Scene {
    // Initialize the scene with its registered key
    constructor() {
        super('BreezySpires');
    }

    // Preload all images, tilemaps, and audio assets required for the level
    preload() {
        this.load.tilemapTiledJSON('breezyMap', 'assets/tilemaps/Breezy Spires.json');
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

        // AUDIO
        this.load.audio('bgm', 'assets/audio/time_for_adventure.mp3');
        this.load.audio('coin', 'assets/audio/coin.wav');
        this.load.audio('jump', 'assets/audio/jump.wav');
        this.load.audio('powerup', 'assets/audio/power_up.wav');
    }

    // Construct the scene: map, objects, physics, UI, camera, and event handlers
    create(data) {
        this.score = data?.score ?? 0;

        // MUSIC
        this.bgm = this.sound.add('bgm', { volume: 0.2, loop: true });
        this.bgm.play();

        // MAP
        const map = this.make.tilemap({ key: 'breezyMap' });
        const tilesetBackground = map.addTilesetImage('Background', 'Background');
        const tilesetConstruction = map.addTilesetImage('Construction', 'Construction');
        const tilesetMain = map.addTilesetImage('Main', 'Main');
        const tilesetRocks = map.addTilesetImage('Rocks', 'Rocks');

        this.background = map.createLayer('background', tilesetBackground).setDepth(-1);
        this.background.setScrollFactor(1, 0.5);

        this.decorations = map.createLayer('decorations', [tilesetRocks, tilesetConstruction, tilesetMain]).setDepth(-1);
        this.platforms = map.createLayer('platforms', [tilesetRocks, tilesetConstruction, tilesetMain]).setDepth(0);

        this.platforms.setCollisionByProperty({ collides: true });
        this.platforms.setCollisionBetween(1, 999);

        // PLAYER
        const spawn = map.getObjectLayer('playerStart').objects.find(obj => obj.name === 'start');

        this.player = this.physics.add.sprite(spawn.x, spawn.y, 'playerExtra1').setCollideWorldBounds(true);
        this.player.body.setSize(18, 18);
        this.player.body.setOffset(0, 0);

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();

        // COINS
        this.coins = this.physics.add.staticGroup();
        map.getObjectLayer('coins').objects.forEach(obj => {
            const coin = this.coins.create(obj.x, obj.y, 'coin1').setOrigin(0.5, 0.5);
            coin.collected = false;
        });

        this.coinTimer = this.time.addEvent({
            delay: 200,
            callback: () => {
                this.coins.getChildren().forEach(coin => {
                    if (!coin.collected) {
                        coin.setTexture(coin.texture.key === 'coin1' ? 'coin2' : 'coin1');
                    }
                });
            },
            loop: true
        });

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            if (!coin.collected) {
                coin.collected = true;
                coin.setVisible(false);
                this.addScore(1);
                this.sound.play('coin');
            }
        });

        // SHRINES
        this.shrines = this.physics.add.staticGroup();
        map.getObjectLayer('shrines').objects.forEach(obj => {
            const shrine = this.shrines.create(obj.x, obj.y, 'shrine').setOrigin(0.5, 0.5);
            shrine.collected = false;
        });

        this.physics.add.overlap(this.player, this.shrines, (player, shrine) => {
            if (!shrine.collected) {
                shrine.collected = true;
                shrine.setVisible(false);
                this.addScore(5);
                this.sound.play('powerup');
            }
        });

        // WIND ZONES
        this.windZones = map.getObjectLayer('windZones')?.objects.map(obj => {
            const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(zone);
            zone.body.setAllowGravity(false);
            zone.body.moves = false;
            return zone;
        });
        
        this.physics.add.overlap(this.player, this.windZones, (player, zone) => {
            player.body.velocity.x += 30;
            if (player.body.velocity.y > -520) {
                player.body.velocity.y = -520;
            }
        });

        // DOORS
        this.doors = map.getObjectLayer('doors').objects.map(obj => {
            const doorZone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(doorZone);
            doorZone.body.setAllowGravity(false);
            doorZone.body.moves = false;
            return doorZone;
        });

        this.physics.add.overlap(this.player, this.doors, () => {
            this.bgm.stop();
            this.scene.start('CongratsScene', {
                nextScene: 'CrumblingHollows',
                score: this.score
            });
        });

        // SCORE TEXT
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(999).setOrigin(-5, 0);

        // CAMERA
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setZoom(5);
        this.cameras.main.roundPixels = true;
    }

    // Add the specified amount to the score and refresh the HUD text
    addScore(amount) {
        this.score += amount;
        this.scoreText.setText('Score: ' + this.score);
    }

    // Handle player input, movement, animations, and per‑frame gravity tweaks
    update() {
        const body = this.player.body;


        if (this.cursors.left.isDown) {
            body.setVelocityX(-150);
            this.player.setFlipX(false);
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(150);
            this.player.setFlipX(true);
        } else {
            body.setVelocityX(0);
        }

        if (this.cursors.up.isDown && body.onFloor()) {
            body.setVelocityY(-450);
            this.sound.play('jump');
        }

        if (!body.onFloor()) {
            this.player.setTexture('playerExtra2');
        } else {
            if (body.velocity.x !== 0) {
                if (!this.lastFrameSwitch || this.time.now - this.lastFrameSwitch > 300) {
                    this.frameToggle = !this.frameToggle;
                    this.player.setTexture(this.frameToggle ? 'playerExtra1' : 'playerExtra2');
                    this.lastFrameSwitch = this.time.now;
                }
            } else {
                this.player.setTexture('playerExtra1');
            }
        }
        // Simple gravity
        if (!body.onFloor() && body.velocity.y > 0) {
            body.setGravityY(1000);
        } else {
            body.setGravityY(800);
        }
    }
}
