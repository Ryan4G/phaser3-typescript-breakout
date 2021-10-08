import Phaser from 'phaser';
import { EVENT_BALL_LOST, EVENT_GAME_OVER, EVENT_NEXT_LEVEL, sceneEvents } from '~events/GameEvents';
import IGameInfo from '~interfaces/IGameInfo';

export default class GameUIScene extends Phaser.Scene {

    private _level?: Phaser.GameObjects.Text;
    private _lives?: Phaser.GameObjects.Image[];
    private _gameOver?: Phaser.GameObjects.Text;

    constructor() {
        super('GameUIScene');
    }

    init(data: IGameInfo){
        this._lives = [];

        this.renderLives(data.lives);

        this.initLevel(data.level);

        this._gameOver = undefined;
    }

    create()
    {
        sceneEvents.on(
            EVENT_BALL_LOST,
            (nums: number) => {
                this.renderLives(nums);
            }
        );
        
        sceneEvents.on(
            EVENT_NEXT_LEVEL,
            (level: number) => {
                this._level?.setText(`Level: ${level}`);
            }
        );

        sceneEvents.once(
            EVENT_GAME_OVER,
            () => {
                this._gameOver = this.add.text(
                    this.scale.width * 0.5,
                    (this.scale.height - 32) * 0.5,
                    '         Game Over\nPress R to restart the game!',
                    {
                        fontSize: '4em',
                        fontStyle: 'bold'
                    }
                ).setOrigin(0.5);
            }
        );

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(EVENT_BALL_LOST);
            sceneEvents.off(EVENT_NEXT_LEVEL);
            sceneEvents.off(EVENT_GAME_OVER);
        });

        const line = new Phaser.Geom.Line(
            0, 32, this.scale.width, 32
        );

        const graphic = this.add.graphics(
            {
                lineStyle:{
                    color: 0xffffff,
                    width: 1
                }
            }
        );

        graphic.strokeLineShape(line);

        this.input.keyboard.on(
            'keydown-R',
            () => {

                if (this._gameOver){
                    this.scene.stop();
                    this.scene.start('GameScene', {level: 1, lives: 3});
                }
            }
        )
    }

    update() {

    }

    private renderLives(lives: number){
        if (this._lives){
            if (this._lives.length > lives){
                while(this._lives.length > lives){
                    this._lives.pop()?.destroy(true);
                }
            }
            else if (this._lives.length < lives){
                while(this._lives.length < lives){
                    this._lives.push(
                        this.add.image(
                            this.scale.width - 100 + 24 * this._lives.length,
                            16,
                            'breakout',
                            'ball2'
                        )
                    );
                }
            }
        }
    }

    private initLevel(level: number){

        this._level = this.add.text(
            16,
            8,
            `Level: ${level}`,
            {
                fontStyle: 'bolder'
            }
        );

    }
}
