import Phaser from 'phaser';
import Paddle from '~sprites/Paddle';

export default class GameScene extends Phaser.Scene {

    private _cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private _paddle?: Paddle;
    private _ball?: Phaser.Physics.Matter.Image;
    private _blocks?: Phaser.Physics.Matter.Image[];

    constructor() {
        super('GameScene');
    }

    create()
    {    
        this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height, 64, true, true, true, false);

        this._cursor = this.input.keyboard.createCursorKeys();

        this._ball = this.matter.add.image(400, 500, 'breakout', 'ball1', {
            chamfer: {
                radius: 10
            }
        });

        this._ball.setBounce(1);
        this._ball.setFrictionAir(0);
        this.matter.body.setInertia(this._ball.body as MatterJS.BodyType, Infinity);

        //this._ball.setVelocity(-10, - 10);

        this._paddle = new Paddle(this.matter.world, 400, 550, 'breakout', 'paddle1', {
            isStatic: true,
            chamfer: {
                radius: 12
            }
        });

        this._paddle.setBounce(1);
        this._paddle.setFriction(0);

        this._paddle.attachBall(this._ball);

        this._blocks = [];
        
        const block = this.matter.add.image(400, 100, 'breakout', 'green1', {
            isStatic: true
        });

        this._blocks.push(block);

        this._ball.setOnCollideWith(this._blocks, (body: MatterJS.BodyType)=>{

            console.log(body);
            if (!body.gameObject){
                return;
            }

            let item = body.gameObject as Phaser.GameObjects.GameObject;
            let idx = this._blocks?.findIndex(it => it == item);

            if (idx !== undefined){
                this._blocks?.splice(idx, 1);
            }

            item.destroy(true);
        });
    }

    update() {

        if (!this._paddle || !this._cursor){
            return;
        }

        this._paddle.update(this._cursor);

        if (this._ball!.y > this.scale.height + 50){
            this._paddle.attachBall(this._ball!);
        }
    }
}
