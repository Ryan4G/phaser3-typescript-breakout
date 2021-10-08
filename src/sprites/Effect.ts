import EffectType from "~enums/EffectType";

export default class Effect extends Phaser.Physics.Matter.Image{

    private _type: EffectType;

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

        this._type = EffectType.None;
    }

    get effectType(){
        return this._type;
    }

    makeEffect(type: EffectType){
        switch(type){
            case EffectType.Large:{
                this.setFrame('Large');
                break;
            }
            case EffectType.Small:{
                this.setFrame('Small');
                break;
            }
            case EffectType.Split:{
                this.setFrame('Split');
                break;
            }
            case EffectType.Sticky:{
                this.setFrame('Sticky');
                break;
            }
            case EffectType.Bolder:{
                this.setFrame('Bolder');
                break;
            }
        }
        this._type = type;
    }

    update(time: number, delta: number){
        if (this.y > this.scene.scale.height - 32){
            console.log('update');
            this.destroy(true);
        }
    }
}