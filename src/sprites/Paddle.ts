export default class Paddle extends Phaser.Physics.Matter.Image{

    private _ball?: Phaser.Physics.Matter.Image;

    /**
     * 
     * @param world A reference to the Matter.World instance that this body belongs to.
     * @param x The horizontal position of this Game Object in the world.
     * @param y The vertical position of this Game Object in the world.
     * @param texture The key, or instance of the Texture this Game Object will use to render with, as stored in the Texture Manager.
     * @param frame An optional frame from the Texture this Game Object is rendering with.
     * @param options An optional Body configuration object that is used to set initial Body properties on creation.
     */
    constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number, options?: Phaser.Types.Physics.Matter.MatterBodyConfig)
    {
        super(world, x, y, texture, frame, options);

        world.scene.add.existing(this);
    }

    attachBall(ball: Phaser.Physics.Matter.Image){
        this._ball = ball;
        this._ball.x = this.x;
        this._ball.y = this.y - this.height * 0.5 - ball.height * 0.5;
        this._ball.setVelocity(0);
    }

    launch(){
        if (this._ball){
            let vec = new Phaser.Math.Vector2(
                this.scene.scale.width * 0.5 - this._ball.x,
                this.scene.scale.height * 0.5 - this._ball.y
            ).normalize().scale(10);
            this._ball?.setVelocity(vec.x, vec.y);
            this._ball = undefined;
        }
    }

    update(cursor: Phaser.Types.Input.Keyboard.CursorKeys){

        let canLeft = this.x > this.width * 0.5;
        let canRight = this.x < this.scene.scale.width - this.width * 0.5;

        if (cursor?.left.isDown && canLeft){
            this.x -= 10;
        }
        else if (cursor?.right.isDown && canRight){
            this.x += 10;
        }
        else if (cursor.space.isDown){
            this.launch();
        }

        if (this._ball){
            this._ball.x = this.x;
        }
    }
}