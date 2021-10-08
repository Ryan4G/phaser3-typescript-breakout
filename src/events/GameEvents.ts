const sceneEvents = new Phaser.Events.EventEmitter();

const EVENT_BALL_LOST = Symbol();
const EVENT_NEXT_LEVEL = Symbol();
const EVENT_GAME_OVER = Symbol();

export {
    sceneEvents,
    EVENT_BALL_LOST,
    EVENT_NEXT_LEVEL,
    EVENT_GAME_OVER
};
