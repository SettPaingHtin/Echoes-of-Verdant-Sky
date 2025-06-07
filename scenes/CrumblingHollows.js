// Phaser scene class for the Crumbling Hollows level
export default class CrumblingHollows extends Phaser.Scene {
    // Register the scene with its key
    constructor() {
        super('CrumblingHollows');
    }

    // Load all tilemaps, images, and audio needed for this level
    preload() {
        this.load.tilemapTiledJSON('crumblingMap', 'assets/tilemaps/Crumbling Hollows.json');
        this.load.image('Backgrounds', 'assets/tilesets/tilemap-backgrounds_packed.png');
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
        this.load.audio('hurt', 'assets/audio/hurt.wav');
    }

    // Build the level: map, hazards, collectibles, UI, and camera behaviour
    create(data) {
        this.score = data?.score ?? 0;

        // MUSIC
        this.bgm = this.sound.add('bgm', { volume: 0.2, loop: true });
        this.bgm.play();

        // MAP & LAYERS
        const map = this.make.tilemap({ key: 'crumblingMap' });
        const tilesetBackground = map.addTilesetImage('Backgrounds', 'Backgrounds');
        const tilesetConstruction = map.addTilesetImage('Construction', 'Construction');
        const tilesetMain = map.addTilesetImage('Main', 'Main');
        const tilesetRocks = map.addTilesetImage('Rocks', 'Rocks');

        this.background = map.createLayer('background', tilesetBackground).setDepth(-2);
        this.acid = map.createLayer('acid', [tilesetRocks, tilesetConstruction, tilesetMain]).setDepth(-1);
        this.platforms = map.createLayer('platforms', [tilesetRocks, tilesetConstruction, tilesetMain]).setDepth(0);
        this.crumblePlatforms = map.createLayer('crumblePlatforms', [tilesetRocks, tilesetConstruction, tilesetMain]).setDepth(0);
        this.decorations = map.createLayer('decorations', [tilesetRocks, tilesetConstruction, tilesetMain]).setDepth(-1);

        this.platforms.setCollisionBetween(1, 999);
        this.crumblePlatforms.setCollisionBetween(1, 999);
        this.platforms.setCollisionByProperty({ collides: true });
        this.crumblePlatforms.setCollisionByProperty({ collides: true });

        // PLAYER
        const spawn = map.getObjectLayer('playerStart').objects.find(obj => obj.name === 'start');

        this.player = this.physics.add.sprite(spawn.x, spawn.y, 'playerExtra1')
            .setCollideWorldBounds(true);

        this.player.body.setSize(18, 18);
        this.player.body.setOffset(0, 0);

        this.physics.add.collider(this.player, this.platforms);

        // CRUMBLING TILES LOGIC
        this.crumblingTiles = new Set();

        this.physics.add.collider(this.player, this.crumblePlatforms, (player, tile) => {
            if (!tile || !tile.properties || !tile.properties.collides) return;

            const tileKey = `${tile.x},${tile.y}`;
            if (!this.crumblingTiles.has(tileKey)) {
                this.crumblingTiles.add(tileKey);

                this.time.delayedCall(500, () => {
                    this.crumblePlatforms.removeTileAt(tile.x, tile.y, true, true);
                    this.crumblingTiles.delete(tileKey);
                });
            }
        }, null, this);

        // INPUT
        this.cursors = this.input.keyboard.createCursorKeys();

        // DOORS (level exit)
        this.doors = map.getObjectLayer('doors').objects.map(obj => {
            const doorZone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(doorZone);
            doorZone.body.setAllowGravity(false);
            doorZone.body.moves = false;
            doorZone.body.setImmovable(true);
            return doorZone;
        });

        this.physics.add.overlap(this.player, this.doors, () => {
            this.bgm.stop();
            this.scene.start('CongratsScene', {
                nextScene: 'CreditsScene',
                score: this.score
            });
        });

        // INSTANT‑DEATH KILL ZONES
        this.killZones = map.getObjectLayer('killZones')?.objects.map(obj => {
            const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(zone);
            zone.body.setAllowGravity(false);
            zone.body.moves = false;
            zone.body.setImmovable(true);
            return zone;
        });

        this.physics.add.overlap(this.player, this.killZones, () => {
            this.bgm.stop();
            this.sound.play('hurt');
            this.scene.start('GameOverScene');
        });

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

        // SCORE HUD
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, {
            fontSize: '16px',
            fill: '#fff'
        });

        // CAMERA CONFIG
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setZoom(4);
        this.cameras.main.roundPixels = true;

        // Store map bottom to detect falling deaths
        this.mapHeight = map.heightInPixels;
    }

    // Increment score and refresh display
    addScore(amount) {
        this.score += amount;
        this.scoreText.setText('Score: ' + this.score);
    }

    // Handle player controls, animations, gravity tweaks, and death conditions
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
            body.setVelocityY(-600);
            this.sound.play('jump');
        }

        if (!body.onFloor() && body.velocity.y > 0) {
            body.setGravityY(1000);
        } else {
            body.setGravityY(800);
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

        // Fail if player falls below the level
        if (this.player.y > this.mapHeight + 100) {
            this.bgm.stop();
            this.sound.play('hurt');
            this.scene.start('GameOverScene');
        }
    }
}
