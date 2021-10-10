import EffectType from "~enums/EffectType";

export default class Ball extends Phaser.Physics.Arcade.Image{

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

        this._type = EffectType.None;
    }

    get effectType(){
        return this._type;
    }
    
    catchEffect(type: EffectType){
        switch(type){
            case EffectType.None:{
                break;
            }
            case EffectType.Sticky:{
                break;
            }
            case EffectType.Bolder:{
                break;
            }
            default:{
                return;
            }
        }

        this._type = type;
    }

    update(time: number, delta: number){
        //console.log(this.y);
        if (this.y > this.scene.scale.height){
            // console.log('update');
            this.destroy(true);
        }
    }
}