import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import {doBoxesIntersect} from './utils/box';
import {Physics, DynamicPhysics} from './physics';
import ClassParser from './utils/class-parser';
import Graphic from './graphic';
import State from './state2';
import {Trigger} from './trigger';

export class Entity {
  constructor(
    public id: string,
    public box: Physics,
    public graphic: Graphic,
    public species: Species,
    public trigger?: Trigger,
  ) {
    // TODO (kyle): generic components
    if (trigger) {
      trigger.parent = this;
    }
  }

  toJSON() {
    return {
      id: this.id,
      box: this.box,
      assetId: this.graphic.asset.id,
      speciesId: this.species.id,
      triggerId: this.trigger && this.trigger.id,
    };
  }

  static fromJSON(state, parser: ClassParser<Physics>, json: any): Entity {
    const entity = new Entity(
      json.id,
      parser.parse(json.box),
      Graphic.fromJSON(state.assets.get(json.assetId)),
      state.species.get(json.speciesId),
      json.triggerId && state.triggers.get(json.triggerId),
    );
    entity.graphic.setPosition(entity.box.position);
    return entity;
  }

  tick(state: State, now: number, delta: number) {
    // TODO (kyle): maybe make physics handle this? dirty property?
    if (this.box instanceof DynamicPhysics) {
      this.box.tick(state, now, delta);
      this.graphic.mesh.position.set(this.box.position.x, this.box.position.y);
    }
  }

  activateNearbyEntity(state: State) {
    for (const entity of state.entities.values()) {
      if (entity !== this && entity.trigger && entity.trigger.canActivate(this)) {
        entity.trigger.activate();
      }
    }
  }
}

export interface PhysicsEntity extends Entity {
  box: DynamicPhysics;
}

export interface Species {
  id: string;
  collides: boolean;
  triggers: boolean;
}
