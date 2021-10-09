import Phaser from 'phaser';
import BlockColors from '~enums/BlockColors';
import EffectType from '~enums/EffectType';
import { EVENT_BALL_LOST, EVENT_GAME_OVER, EVENT_NEXT_LEVEL, sceneEvents } from '~events/GameEvents';
import IGameInfo from '~interfaces/IGameInfo';
import Ball from '~sprites/Ball';
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
    private _ball?: Ball;
    private _blocks?: Phaser.Physics.Arcade.StaticGroup;
    private _lives: number = 3;
    private _level: number = 1;
    private _blockMap: number[][];

    private _ballCollideWall?: Map<string, number>;
    private _effects?: Phaser.Physics.Arcade.Group;
    private _balls?: Phaser.Physics.Arcade.Group;

    private _ballCount:number = 1;

    constructor() {
        super('GameScene');
        this._blockMap = [];
    }

    init(data: IGameInfo){
        if (data.level){
            this._lives = data.lives;
            this._level = data.level;
            this._ballCount = 1;
        }

        this._ballCollideWall = new Map<string, number>();
    }

    create()
    {    
        this.scene.launch('GameUIScene', {
            level: this._level,
            lives: this._lives
        });

        this.physics.world.setBounds(0, 32, this.scale.width, this.scale.height - 32, true, true, true, false);

        this._cursor = this.input.keyboard.createCursorKeys();

        this._paddle = new Paddle(this, 400, 550, 'breakout', 'paddle1');
        
        this._balls = this.physics.add.group({
            classType: Ball,
            runChildUpdate: true
        });

        this._ball = this.getBall(400, 500);

        this._blocks = this.physics.add.staticGroup();
        this._effects = this.physics.add.group({
            classType: Effect,
            runChildUpdate: true
        });

        this.initBlocks(this._level);

        this._paddle.attachBall(this._ball!);

        const ballBlockCollider = this.physics.add.collider(this._balls, this._blocks, (obj1, obj2) => {
            let theBall = obj1 as Ball;
            let theBlock = obj2 as Phaser.Types.Physics.Arcade.ImageWithStaticBody;

            if (theBlock){
                let effectType = theBlock.getData('effect') as EffectType;

                if (effectType !== undefined && effectType !== EffectType.None){

                    let theEffect = this._effects!.get(
                        theBlock.x, 
                        theBlock.y, 
                        'effect', 
                        'Large'
                    ) as Effect;

                    theEffect.setVelocityY(40);
                    theEffect.makeEffect(effectType);
                }
            }

            theBlock.destroy(true);

            this.sound.playAudioSprite('sfx', 'hitblock');

            if(this.checkCompleteLevel()){
                
                sceneEvents.emit(
                    EVENT_NEXT_LEVEL,
                    ++this._level
                );

                this.scene.restart();
            }
        });

        const ballBlockOverlap = this.physics.add.overlap(this._balls, this._blocks, (obj1, obj2) => {
            let theBall = obj1 as Ball;
            let theBlock = obj2 as Phaser.Types.Physics.Arcade.ImageWithStaticBody;

            if (theBlock){
                let effectType = theBlock.getData('effect') as EffectType;

                if (effectType !== undefined && effectType !== EffectType.None){

                    let theEffect = this._effects!.get(
                        theBlock.x, 
                        theBlock.y, 
                        'effect', 
                        'Large'
                    ) as Effect;

                    theEffect.setVelocityY(40);
                    theEffect.makeEffect(effectType);
                }
            }

            theBlock.destroy(true);

            this.sound.playAudioSprite('sfx', 'hitblock');

            if(this.checkCompleteLevel()){
                
                sceneEvents.emit(
                    EVENT_NEXT_LEVEL,
                    ++this._level
                );

                this.scene.restart();
            }
        });

        ballBlockOverlap.active = false;
        
        this.physics.add.collider(this._balls, this._paddle, (obj1, obj2) => {

            //console.log(obj1, obj2);

            let theBall = obj2 as Ball;
            let thePaddle = this._paddle;

            if (!thePaddle){
                return;
            }

            if (theBall.getData('attached')){
                return;
            }

            this.sound.playAudioSprite('sfx', 'hitpaddle');

            if (theBall.effectType === EffectType.Sticky){
                if (thePaddle.attchedBall){
                    this._paddle?.launch();
                }

                this._paddle?.attachBall(theBall);
            }
            else{
                let velocity = theBall.body.velocity.x;

                if (this._paddle!.x === theBall!.x){
                    velocity = theBall.body.velocity.x + Phaser.Math.Between(-2, 2);
                }

                theBall?.setVelocityX(velocity);
            }
        });
        
        this.physics.add.overlap(this._paddle, this._effects, (obj1, obj2)=>{

            console.log('overlap')
            let theEffect = obj2 as Effect;

            if (theEffect){
                let effectType = theEffect.effectType;
                this._paddle?.catchEffect(effectType);

                if (effectType === EffectType.Split){
                    let currentBalls = this._balls?.getChildren();
                    
                    if (this._paddle?.attchedBall){
                        this._paddle.launch();
                    }

                    currentBalls?.forEach(item=>{
                        
                        let add_idx = 0;

                        while(add_idx < 2){

                            let ball = this.getBall(
                                item.body.position.x,
                                item.body.position.y
                            );

                            ball.setVelocity(
                                item.body.velocity.x + Phaser.Math.Between(5, 10) * (add_idx > 0 ? 1 : -1),
                                item.body.velocity.y + Phaser.Math.Between(5, 10) * (add_idx > 0 ? 1 : -1)
                            );

                            add_idx++;
                        }

                    });

                    effectType = EffectType.None;
                }
                
                if (effectType === EffectType.Bolder){
                    ballBlockCollider.active = false;
                    ballBlockOverlap.active = true;
                }
                else if (effectType === EffectType.Sticky || effectType === EffectType.None){
                    ballBlockCollider.active = true;
                    ballBlockOverlap.active = false;
                }

                this._balls?.getChildren().forEach(item=>{
                    let ball = item as Ball;
                    ball.catchEffect(effectType);
                });

                theEffect.destroy(true);
            }
        });

        this.physics.world.on(
            Phaser.Physics.Arcade.Events.WORLD_BOUNDS,
            (body: Phaser.Physics.Arcade.Body) => {
                
                console.log(body);

                if (this._balls?.contains(body.gameObject)){
                    this.sound.playAudioSprite('sfx', 'hitwall');
                }
            }
        );
    }

    update() {

        if (!this._paddle || !this._cursor || this._lives <= 0){
            return;
        }

        this._paddle.update(this._cursor);

        this._ballCount = this._balls!.getTotalUsed();

        if (this._ballCount === 0){

            sceneEvents.emit(
                EVENT_BALL_LOST,
                --this._lives
            );

            if (this._lives > 0){
                this._ball = this.getBall(400, 500);
                this._paddle.attachBall(this._ball!);
            }
            else{
                sceneEvents.emit(
                    EVENT_GAME_OVER
                );
            }
        }
    }

    private getBall(x: number, y: number){

        let ball = this._balls?.get(
            x, y, 'breakout', 'ball1'
        ) as Ball;
        
        ball.setBounce(1);
        ball.setFriction(0);
        (ball.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true, 1, 1, true);
        ball.setCircle(11);

        return ball;
    }

    private initBlocks(level: number){

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
                    if (num !== -1){
                        blockNumberArr.push(blockNumberArr.length);
                    }
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

            console.log(blockEffectMap)
            let blockIdx = 0;

            for(let row = 0; row < map.data.length; row++){
                for (let col = 0; col < map.data[row].length; col++){

                    let item = map.data[row][col];

                    if (item === -1){
                        continue;
                    }
                    
                    blockIdx++;

                    const block = this._blocks!.get(
                        blockSize.width * (col + 0.75), 
                        blockSize.height * (row + 0.5) + 32,
                        'breakout', BlockColors[item]
                    ) as Phaser.Types.Physics.Arcade.ImageWithStaticBody;                
                    
                    if (blockEffectMap.get(blockIdx) !== undefined){
                        console.log(blockIdx)
                        block.setData('effect', blockEffectMap.get(blockIdx));
                    }
            
                }
            }
        }
    }

    private checkCompleteLevel(){
        return this._blocks?.getTotalUsed() === 0;
    }
}
