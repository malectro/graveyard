import * as PointMath from './utils/point';
import * as Hero from './hero';
import {Socket, sendMessage} from './websocket';
import State from './state2';

export function init(state: State, socket?: Socket) {
  const keys = {
    ArrowDown: {x: 0, y: 1},
    ArrowUp: {x: 0, y: -1},
    ArrowRight: {x: 1, y: 0},
    ArrowLeft: {x: -1, y: 0},
  };

  const currentKeys = new Set();

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      const key = keys[event.key];

      if (key) {
        event.preventDefault();

        if (!currentKeys.has(event.key)) {
          currentKeys.add(event.key);

          PointMath.add(state.hero.direction, key);
          state.hero.lastUpdate = Date.now();
          resolveVelocity();
        }
      }
    },
    {capture: true},
  );

  window.addEventListener(
    'keyup',
    event => {
      const key = keys[event.key];

      if (key) {
        event.preventDefault();

        if (currentKeys.has(event.key)) {
          currentKeys.delete(event.key);

          PointMath.subtract(state.hero.direction, key);
          resolveVelocity();
          //console.log('hero is at', state.hero.x, state.hero.y);
        }
      }
    },
    {capture: true},
  );

  function resolveVelocity() {
    //Hero.move(state.hero, state.sprites.values(), Date.now());
    Hero.resolveVelocity(state.hero);

    if (socket) {
      sendMessage(socket, {
        type: 'hero/move',
        payload: state.hero.direction,
      });
    }
  }
}
