import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import {Box, PhysicsBox} from './utils/box';
import Graphic from './graphic';

export class Entity {
  constructor(
    public id: string,
    public box: Box,
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

  static fromJSON(state, json: any): Entity {
    const entity = new Entity(
      json.id,
      json.box,
      Graphic.fromJSON(state.assets.get(json.assetId)),
      state.species.get(json.speciesId),
    );
    entity.graphic.setPosition(entity.box.position);
    return entity;
  }
}

export interface PhysicsEntity extends Entity {
  box: PhysicsBox;
}

export interface Species {
  id: string;
  collides: boolean;
}
