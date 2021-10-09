import EffectType from "~enums/EffectType";

export default class Paddle extends Phaser.Physics.Arcade.Image{

    private _ball?: Phaser.Physics.Arcade.Image;
    private _type: EffectType;
    
    /**
     * 
     * @param scene The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param x The horizontal position of this Game Object in the world.
     * @param y The vertical position of this Game Object in the world.
     * @param texture The key, or instance of the Texture this Game Object will use to render with, as stored in the Texture Manager.
     * @param frame An optional frame from the Texture this Game Object is rendering with.
     */
     constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number)
     {
         super(scene, x, y, texture, frame);
 

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setPushable(false);

        this._type = EffectType.None;
    }

    get attched(){
        return this._ball !== undefined;
    }

    get effectType(){
        return this._type;
    }

    attachBall(ball: Phaser.Physics.Arcade.Image){
        this._ball = ball;
        this._ball.x = this.x;

        let y = this.y - this.height * 0.5 - ball.height * 0.5;

        this._ball.y = y;
        this._ball.setVelocity(0);
    }

    launch(){
        if (this._ball){
            let vec = new Phaser.Math.Vector2(
                this.scene.scale.width * 0.5 - this._ball.x,
                this.scene.scale.height * 0.5 - this._ball.y
            ).normalize().scale(300);
            this._ball?.setVelocity(vec.x, vec.y);
            this._ball = undefined;
            
            this.scene.sound.playAudioSprite('sfx', 'hitpaddle');
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

    catchEffect(type: EffectType){
        switch(type){
            case EffectType.None:{
                break;
            }
            case EffectType.Sticky:{
                break;
            }
            case EffectType.Large:{
                
                if (this._type !== EffectType.Large){
                    this.scene.add.tween(
                        {
                            targets: this,
                            scaleX: 1.25,
                            ease: 'Expo.easeInOut',
                            duration: 800,
                        }
                    );
                }

                break;
            }
            case EffectType.Small:{

                if (this._type !== EffectType.Small){
                    this.scene.add.tween(
                        {
                            targets: this,
                            scaleX: 0.75,
                            ease: 'Expo.easeInOut',
                            duration: 800,
                        }
                    );
                }
                break;
            }
        }

        this._type = type;
    }
}