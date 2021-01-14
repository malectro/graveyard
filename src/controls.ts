import * as PointMath from './utils/point';
import * as Hero from './hero';
import {Socket, sendMessage} from './websocket';
import State from './state2';

export function adaptBrowserController(
  controller: Controller,
  adapter = browserExplorationAdapter,
) {
  //const controller = new ExplorationController(state);
  const currentKeys = new Set();

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = adapter[event.key];

    if (key) {
      event.preventDefault();

      if (!currentKeys.has(event.key)) {
        currentKeys.add(event.key);
        controller[key.method](true, key.payload);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown, {capture: true});

  const handleKeyUp = event => {
    const key = adapter[event.key];

    if (key) {
      event.preventDefault();

      if (currentKeys.has(event.key)) {
        currentKeys.delete(event.key);
        controller[key.method](false, key.payload);
      }
    }
  };

  window.addEventListener('keyup', handleKeyUp, {capture: true});

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}

type Direction = 'down' | 'up' | 'left' | 'right';
interface Controller {}

export class ExplorationController {
  static directions = {
    down: {x: 0, y: 1},
    up: {x: 0, y: -1},
    right: {x: 1, y: 0},
    left: {x: -1, y: 0},
  };

  constructor(private state: State, private socket: Socket) {}

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
    if (this.socket) {
      sendMessage(this.socket, {
        type: 'hero/move',
        payload: state.hero.box.direction,
      });
    }
    */
  }
}

const browserExplorationAdapter = {
  ArrowDown: {method: 'direction', payload: 'down'},
  ArrowUp: {method: 'direction', payload: 'up'},
  ArrowLeft: {method: 'direction', payload: 'left'},
  ArrowRight: {method: 'direction', payload: 'right'},
  ' ': {method: 'activate'},
};

export class GlobalInput {
  private controller;
  private destroyAdapter;

  setController(controller) {
    if (this.destroyAdapter) {
      this.destroyAdapter();
    }
    this.controller = controller;
  }

  setAdapter(adapter) {
    if (this.destroyAdapter) {
      this.destroyAdapter();
    }
    this.destroyAdapter = adapter(this.controller);
  }
}
