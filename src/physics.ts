import {reduce} from './utils/iterable';
import * as p from './utils/point';
import {PhysicsBox, Box, intersectSegment, doBoxesIntersect} from './utils/box';
import {Entity} from './entity';
import Component from './component';
import State from './state2';

export interface Physics extends Component, Box {}

export class StaticPhysics implements Physics {
  position: p.Vector2;
  size: p.Vector2;
  halfSize: p.Vector2;

  static fromJSON(json: any): StaticPhysics {
    const physics = new this();
    physics.position = json.position;
    physics.size = json.size;
    physics.halfSize = p.scale(p.copy(json.size), 0.5);
    return physics;
  }

  tick(state: State, now: number, _delta: number): void {
    return undefined;
  }
}

export class DynamicPhysics implements PhysicsBox, Physics {
  position: p.Vector2;
  size: p.Vector2;
  halfSize: p.Vector2;
  speed = 0;
  friction = 1;
  facing: p.Vector2 = p.point();
  acceleration: p.Vector2 = p.point();
  direction: p.Vector2 = p.point();
  velocity: p.Vector2 = p.point();
  futurePosition: p.Vector2 = p.point();
  lastUpdate = 0;
  // TODO (kyle): possible memory leak
  lastHitEntity: Entity | null = null;

  constructor(box: Partial<PhysicsBox>) {
    Object.assign(this, box);
    this.halfSize = p.scale(p.copy(this.size), 0.5);
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

  tick(state: State, now: number, delta: number): void {
    if (this.isMoving()) {
      this.move(state.entities.values(), now, delta);
    }
  }

  isMoving(): boolean {
    return !p.isZero(this.acceleration) || !p.isZero(this.velocity);
  }

  move(entities: IterableIterator<Entity>, now: number, delta: number): void {
    const duration = delta;
    //const duration = now - this.lastUpdate;

    // acceleration
    p.add(
      this.velocity,
      p.scale({...this.acceleration}, duration),
    );

    // friction
    p.scale(
      this.velocity,
      Math.pow(this.friction, duration),
    );

    // prevent exponential slowdown
    if (p.isZero(this.acceleration) && p.cheapLength(this.velocity) < 1) {
      p.scale(this.velocity, 0);
    }

    // move
    const travelVector = p.scale({...this.velocity}, duration);
    p.add(this.position, travelVector);

    // check for collisions
    for (const entity of entities) {
      if (entity.box !== this && entity.species.collides && doBoxesIntersect(this, entity.box)) {
        this.lastHitEntity = entity;

        const adjustment = p.point();

        if (this.velocity.x > 0) {
          adjustment.x = this.position.x + this.size.x - entity.box.position.x;
        } else {
          adjustment.x = this.position.x - (entity.box.position.x + entity.box.size.x);
        }
        if (this.velocity.y > 0) {
          adjustment.y = this.position.y + this.size.y - entity.box.position.y;
        } else {
          adjustment.y = this.position.y - (entity.box.position.y + entity.box.size.y);
        }

        if (Math.abs(adjustment.x) < Math.abs(adjustment.y)) {
          this.position.x -= adjustment.x;
        } else {
          this.position.y -= adjustment.y;
        }
        /*
        if (this.velocity.x === 0) {
          this.position.y -= adjustment.y;
        } else if (this.velocity.y === 0) {
          this.position.x -= adjustment.x;
        } else {
          adjustment.x = adjustment.x / this.velocity.x;
          adjustment.y = adjustment.y / this.velocity.y;
          const adjustmentValue = Math.min(adjustment.x, adjustment.y);
          this.position.x -= this.velocity.x * adjustmentValue;
          this.position.y -= this.velocity.y * adjustmentValue;
        }
        */
      }
    }

    // adjust visible direction
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      p.set(this.facing, this.direction);
    }

    //p.set(this.position, this.futurePosition);

    this.lastUpdate = now;
  }
}
