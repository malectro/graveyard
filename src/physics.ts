import {reduce} from './utils/iterable';
import * as p from './utils/point';
import {PhysicsBox, Box, intersectSegment} from './utils/box';
import {Entity} from './entity';
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

  tick(state: State, now: number, _delta: number): void {
    return undefined;
  }
}

export class DynamicPhysics implements PhysicsBox, Physics {
  position: p.Vector2;
  size: p.Vector2;
  speed = 0;
  direction: p.Vector2 = p.point();
  velocity: p.Vector2 = p.point();
  futurePosition: p.Vector2 = p.point();
  lastUpdate = 0;

  constructor(box: Partial<PhysicsBox>) {
    return Object.assign(this, box);
  }

  static fromJSON(json: any): DynamicPhysics {
    const physics = new this(json);
    return physics;
  }

  toJSON(): any {
    const json = {
      className: this.constructor.name,
    };
    for (const propName of ['position', 'size', 'speed']) {
      json[propName] = this[propName];
    }
    return json;
  }

  tick(state: State, now: number, _delta: number): void {
    if (this.isMoving()) {
      this.move(state.entities.values(), now);
    }
  }

  isMoving(): boolean {
    return !p.isZero(this.velocity);
  }

  move(entities: IterableIterator<Entity>, now: number): void {
    const duration = now - this.lastUpdate;
    const travelVector = p.scale({...this.velocity}, duration);

    p.add(p.set(this.futurePosition, this.position), travelVector);

    const intersection = reduce(
      entities,
      (info, entity) => {
        const point = intersectSegment(
          entity.box,
          this.position,
          this.futurePosition,
        );
        if (point) {
          const distance = p.cheapDistance(this.position, point);
          if (distance < info.d) {
            info.d = distance;
            info.p = point;
          }
        }
        return info;
      },
      {d: Infinity, p: null},
    );

    if (intersection.p) {
      p.add(p.set(this.position, intersection.p), p.scale(travelVector, -0.1));
    } else {
      p.set(this.position, this.futurePosition);
    }

    this.lastUpdate = now;
  }
}
