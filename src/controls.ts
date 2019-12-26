import * as PointMath from './utils/point';
import * as Hero from './hero';
import {Socket, sendMessage} from './websocket';
import State from './state2';

export function init(state: State, socket?: Socket) {
  const controller = new ExplorationController(state);

  const keys = {
    ArrowDown: {method: 'direction', payload: 'down'},
    ArrowUp: {method: 'direction', payload: 'up'},
    ArrowLeft: {method: 'direction', payload: 'left'},
    ArrowRight: {method: 'direction', payload: 'right'},
    ' ': {method: 'activate'},
  };

  const currentKeys = new Set();

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      const key = keys[event.key];

      console.log('key', event.key);

      if (key) {
        event.preventDefault();

        if (!currentKeys.has(event.key)) {
          currentKeys.add(event.key);
          controller[key.method](true, key.payload);
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
          controller[key.method](false, key.payload);
        }
      }
    },
    {capture: true},
  );
}

class BrowserKeyboardControllerAdapter {
  constructor(private keys: {[key: string]: string}, public controller: Controller) {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: KeyboardEvent) => {

  };

  handleKeyUp = (event: KeyboardEvent) => {
    
  };
}

interface Controller {
  
}

class ExplorationController {
  static directions = {
    down: {x: 0, y: 1},
    up: {x: 0, y: -1},
    right: {x: 1, y: 0},
    left: {x: -1, y: 0},
  };

  constructor(private state: State) {}

  direction(buttonOn: boolean, direction) {
    const vector = ExplorationController.directions[direction];
    if (buttonOn) {
      PointMath.add(this.state.hero.box.direction, vector);
    } else {
      PointMath.subtract(this.state.hero.box.direction, vector);
    }
    this.resolveVelocity();
  }

  activate(_buttonOn: boolean) {
    this.state.hero.activateNearbyEntity(this.state);
  }

  resolveVelocity() {
    this.state.hero.box.lastUpdate = Date.now();
    Hero.resolveVelocity(this.state.hero.box);

    /*
    if (socket) {
      sendMessage(socket, {
        type: 'hero/move',
        payload: state.hero.box.direction,
      });
    }
    */
  }
}
