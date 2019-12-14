import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import {Physics, DynamicPhysics} from './utils/box';
import ClassParser from './utils/class-parser';
import Graphic from './graphic';

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
}

export interface PhysicsEntity extends Entity {
  box: DynamicPhysics;
}

export interface Species {
  id: string;
  collides: boolean;
}
