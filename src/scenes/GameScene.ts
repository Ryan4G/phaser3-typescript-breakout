import Phaser from 'phaser';
import BlockColors from '~enums/BlockColors';
import EffectType from '~enums/EffectType';
import { EVENT_BALL_LOST, EVENT_GAME_OVER, EVENT_NEXT_LEVEL, sceneEvents } from '~events/GameEvents';
import IGameInfo from '~interfaces/IGameInfo';
import Effect from '~sprites/Effect';
import Paddle from '~sprites/Paddle';
import fisher_yates_shuffle from '~utils/Shuffle';

interface ILevelInfo{
    level: number;
    data: number[][];
    effect: number[];
};

export default class GameScene extends Phaser.Scene {

    private _cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private _paddle?: Paddle;
    private _ball?: Phaser.Physics.Matter.Image;
    private _blocks?: Phaser.Physics.Matter.Image[];
    private _lives: number = 3;
    private _level: number = 1;
    private _blockMap: number[][];

    private _ballCollideWall?: Map<string, number>;
    private _effects: Array<Effect>;
    private _notCollisionGroup?: number;

    constructor() {
        super('GameScene');
        this._blockMap = [];
        this._effects = [];
    }

    init(data: IGameInfo){
        if (data.level){
            this._lives = data.lives;
            this._level = data.level;
        }

        this._ballCollideWall = new Map<string, number>();
        this._effects = [];
    }

    create()
    {    
        this.scene.launch('GameUIScene', {
            level: this._level,
            lives: this._lives
        });

        this.matter.world.setBounds(0, 32, this.scale.width, this.scale.height - 32, 64, true, true, true, true);

        this._cursor = this.input.keyboard.createCursorKeys();

        this._notCollisionGroup = this.matter.world.nextGroup(true);

        this._paddle = new Paddle(this.matter.world, 400, 550, 'breakout', 'paddle1', {
            isStatic: true,
            chamfer: {
                radius: 12
            }
        });

        this._ball = this.initBall();

        this._ball.setCollisionGroup(this._notCollisionGroup);

        this.initBlocks(this._level);

        this._paddle.attachBall(this._ball);

        this._ball.setOnCollideWith(this._blocks!, (body: MatterJS.BodyType)=>{

            if (!body.gameObject){
                return;
            }

            let item = body.gameObject as Phaser.GameObjects.GameObject;
            let idx = this._blocks?.findIndex(it => it == item);

            if (idx !== undefined){
                let theBlock = this._blocks?.splice(idx, 1);

                if (theBlock){
                    let effectType = item.getData('effect') as EffectType;

                    if (effectType !== undefined && effectType !== EffectType.None){

                        let theEffect = new Effect(this.matter.world, theBlock[0].x, theBlock[0].y, 'effect', 'Large',{
                            isStatic: true
                        });

                        theEffect.makeEffect(effectType);
                        theEffect.setCollisionGroup(this._notCollisionGroup!);

                        this._effects.push(theEffect);
                    }
                }
            }

            item.destroy(true);

            this.sound.playAudioSprite('sfx', 'hitblock');

            if(this.checkCompleteLevel()){
                
                sceneEvents.emit(
                    EVENT_NEXT_LEVEL,
                    ++this._level
                );

                this.scene.restart();
            }
        });

        this._ball.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
            if (data.bodyA.gameObject === null || data.bodyB.gameObject === null){
                this.sound.playAudioSprite('sfx', 'hitwall');
            }
        });

        this._ball.setOnCollideWith(this._paddle, () => {
            this.sound.playAudioSprite('sfx', 'hitpaddle');

            if (this._paddle?.effectType === EffectType.Sticky){
                this._paddle.attachBall(this._ball!);
            }
        });

        this._paddle.setOnCollideWith(this._effects, (body: MatterJS.BodyType)=>{

            if (!body.gameObject){
                return;
            }

            
            let item = body.gameObject as Phaser.GameObjects.GameObject;
            let idx = this._effects?.findIndex(it => it == item);

            if (idx !== undefined){
                let theEffect = this._effects?.splice(idx, 1);

                if (theEffect){
                    let effectType = theEffect[0].effectType;
                   this._paddle?.catchEffect(effectType);
                }
            }

            item.destroy(true);
        });
    }

    update() {

        if (!this._paddle || !this._cursor || this._lives <= 0){
            return;
        }

        if (this._effects && this._effects.length > 0){
            Phaser.Actions.IncY(this._effects, 0, 0.5);
        }

        this._paddle.update(this._cursor);

        if (this._ball!.y > this.scale.height + 50){

            sceneEvents.emit(
                EVENT_BALL_LOST,
                --this._lives
            );

            if (this._lives > 0){
                this._paddle.attachBall(this._ball!);
            }
            else{
                sceneEvents.emit(
                    EVENT_GAME_OVER
                );
            }
        }
    }

    private initBall(){

        this._ball = this.matter.add.image(400, 500, 'breakout', 'ball1', {
            chamfer: {
                radius: 10
            }
        });

        this._ball.setBounce(1);
        this._ball.setFriction(0);
        this._ball.setFrictionAir(0);
        this._ball.setData('id', '1');

        this.matter.body.setInertia(this._ball.body as MatterJS.BodyType, Infinity);

        return this._ball;
    }

    private initBlocks(level: number){

        this._blocks = [];

        let levels = this.cache.json.get('levels') as Array<ILevelInfo>;

        let map = levels.find(item => item.level === level);

        let blockSize = {
            width: 64,
            height: 32
        };

        if (map){
            let effectArr = map.effect;
            let blockNumberArr:Array<number> = [];

            map.data.forEach(arr => {
                arr.forEach(num=> {
                    blockNumberArr.push(blockNumberArr.length);
                });
            });

            // create a random block number array
            fisher_yates_shuffle(blockNumberArr);

            let blockEffectMap = new Map<number, EffectType>();

            console.log(effectArr)
            console.log(blockNumberArr)

            for(let idx = 0; idx < effectArr.length; idx++){
                let num = effectArr[idx];

                while(num > 0){
                    let randBlock = blockNumberArr.shift();

                    if (randBlock !== undefined){
                        blockEffectMap.set(randBlock, idx as EffectType);
                    }

                    num--;
                }
            }

            let blockIdx = 0;

            for(let row = 0; row < map.data.length; row++){
                for (let col = 0; col < map.data[row].length; col++, blockIdx++){

                    let item = map.data[row][col];

                    if (item === -1){
                        continue;
                    }

                    const block = this.matter.add.image(
                        blockSize.width * (col + 0.75), 
                        blockSize.height * (row + 0.5) + 32,
                        'breakout', BlockColors[item], 
                        {
                            isStatic: true
                        }
                    );
            
                    if (blockEffectMap.get(blockIdx) !== undefined){
                        block.setData('effect', blockEffectMap.get(blockIdx));
                    }

                    this._blocks.push(block);
            
                }
            }
        }
    }

    private checkCompleteLevel(){
        return !this._blocks?.some(item => item.visible);
    }
}
