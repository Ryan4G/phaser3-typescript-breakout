import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    preload()
    {
        this.load.atlas('breakout', 'assets/atlas/breakout.png', 'assets/atlas/breakout.json');
        this.load.image('particle', 'assets/atlas/particle3.png');
    }

    create()
    {
        this.scene.start('GameScene');
    }

    update() {

    }
}
