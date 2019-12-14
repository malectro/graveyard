import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import {Physics, DynamicPhysics} from './physics';
import ClassParser from './utils/class-parser';
import Graphic from './graphic';
import State from './state2';

export class Entity {
  constructor(
    public id: string,
    public box: Physics,
    public graphic: Graphic,
    public species: Species,
  ) {}

  toJSON() {
    return {
      id: this.id,
      box: this.box,
      assetId: this.graphic.asset.id,
      speciesId: this.species.id,
    };
  }

  static fromJSON(state, parser: ClassParser, json: any): Entity {
    const entity = new Entity(
      json.id,
      parser.parse(json.box),
      Graphic.fromJSON(state.assets.get(json.assetId)),
      state.species.get(json.speciesId),
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
}

export interface PhysicsEntity extends Entity {
  box: DynamicPhysics;
}

export interface Species {
  id: string;
  collides: boolean;
}
