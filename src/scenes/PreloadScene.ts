import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    preload()
    {
        this.load.atlas('breakout', 'assets/atlas/breakout.png', 'assets/atlas/breakout.json');
        this.load.atlas('effect', 'assets/atlas/effect_atlas.png', 'assets/atlas/effect_atlas.json');
        this.load.image('particle', 'assets/atlas/particle3.png');
        this.load.json('levels', 'assets/maps/levels.json');
        
        this.load.audioSprite('sfx', 'assets/sounds/breakout.json', 'assets/sounds/breakout.mp3');
    }

    create()
    {
        this.scene.start('GameScene');
    }

    update() {

    }
}
