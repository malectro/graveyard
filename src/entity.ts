import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point.ts';
import {doBoxesIntersect} from './utils/box.ts';
import {Physics, DynamicPhysics, OverlayPhysics} from './physics.ts';
import ClassParser from './utils/class-parser.ts';
import {Graphic} from './graphic.ts';
import State from './state2.ts';
import {Trigger} from './trigger.ts';

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

    // TODO (kyle): should all physics/components get a reference to the entity?
    if (this.box instanceof OverlayPhysics) {
      this.box.entity = this;
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

  static fromJSON(state, parsers: {
    physics: ClassParser<Physics>;
    graphic: ClassParser<Graphic>;
  }, json: any): Entity {
    const entity = new Entity(
      json.id,
      parsers.physics.parse(json.box),
      parsers.graphic.parse(state.assets.get(json.assetId)),
      state.species.get(json.speciesId),
      json.triggerId && state.triggers.get(json.triggerId),
    );
    entity.graphic.mesh.position.set(entity.box.position.x, entity.box.position.y);
    return entity;
  }

  tick(state: State, now: number, delta: number): void {
    // TODO (kyle): maybe use dirty property to only update stuff that needs updating?
    this.box.tick(state, now, delta);
    this.graphic.update(this.box);
    //this.graphic.mesh.position.set(this.box.position.x, this.box.position.y);
    //this.graphic.mesh.position.set(this.box.position.x + this.box.halfSize.x, this.box.position.y + this.box.halfSize.y);
  }

  activateNearbyEntity(state: State): void {
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
