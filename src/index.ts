import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';

import GameScene from './scenes/GameScene'
import GameUIScene from '~scenes/GameUIScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
    backgroundColor: '#000000',
	physics: {
		default: 'matter',
		matter: {
			gravity: { y: 0 },
			debug: false
		}
	},
	scene: [PreloadScene, GameScene, GameUIScene]
}

export default new Phaser.Game(config)
