import * as p from './utils/point';
import {PhysicsBox, Box} from './utils/box';
import Component from './component';
import State from './state2';

export interface Physics extends Component, Box {}

export class StaticPhysics implements Physics {
  position: p.Vector2;
  size: p.Vector2;

  static fromJSON(json: any): StaticPhysics {
    const physics = new this();
    physics.position = json.position;
    physics.size = json.size;
    return physics;
  }

  tick(state: State, now: number, delta: number) {}
}

export class DynamicPhysics implements PhysicsBox, Physics {
  position: p.Vector2;
  size: p.Vector2;
  speed: number = 0;
  direction: p.Vector2 = p.point();
  velocity: p.Vector2 = p.point();
  futurePosition: p.Vector2 = p.point();
  lastUpdate: number = 0;

  constructor(box: Partial<PhysicsBox>) {
    return Object.assign(this, box);
  }

  static fromJSON(json: any): DynamicPhysics {
    const physics = new this(json);
    return physics;
  }

  tick(state: State, now: number, delta: number) {}

  toJSON() {
    const json = {
      className: this.constructor.name,
    };
    for (const propName of ['position', 'size', 'speed']) {
      json[propName] = this[propName];
    }
    return json;
  }
}
