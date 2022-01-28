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

  const handlePointerMove = event => {
    if (controller.pointerMove) {
      controller.pointerMove(
        event.clientX,
        event.clientY,
      );
    }
  };

  window.addEventListener('pointermove', handlePointerMove);

  return () => {
    window.removeEventListener('keydown', handleKeyDown, {capture: true});
    window.removeEventListener('keyup', handleKeyUp, {capture: true});
    window.removeEventListener('pointermove', handlePointerMove);
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

export class PlacementController {
  static directions = {
    down: {x: 0, y: 1},
    up: {x: 0, y: -1},
    right: {x: 1, y: 0},
    left: {x: -1, y: 0},
  };

  constructor(private state: State, private onPlace: () => void) {}

  direction(buttonOn: boolean, direction) {
    const vector = ExplorationController.directions[direction];
    console.log('moving', vector, buttonOn);
    if (buttonOn) {
      PointMath.add(this.state.futurePlot.box.position, PointMath.scale(PointMath.copy(vector), 10));
    }
  }

  activate(buttonOn: boolean) {
    if (buttonOn) {
      this.onPlace();
    }
    // TODO (kyle): place the tombstone
    //this.state.futurePlot.place(this.state);
  }

  pointerMove(x, y) {
    // TODO
      this.state.futurePlot.box.position,
      x,
      y,
  }
}

export class GlobalInput {
  private controller;
  private adapter;
  private destroyAdapter;

  setController(controller, adapter = null) {
    if (this.destroyAdapter) {
      this.destroyAdapter();
    }
    this.adapter = adapter;
    this.controller = controller;
    this.destroyAdapter = adapter && adapter(controller);
  }

  setAdapter(adapter) {
    if (this.destroyAdapter) {
      this.destroyAdapter();
    }
    this.adapter = adapter;
    this.destroyAdapter = adapter && adapter(this.controller);
  }

  pauseAdapter() {
    if (this.destroyAdapter) {
      this.destroyAdapter();
    }
  }

  startAdapter() {
    const {adapter} = this;
    if (adapter) {
      this.destroyAdapter = adapter && adapter(this.controller);
    }
  }
}
