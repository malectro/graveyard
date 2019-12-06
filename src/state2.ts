import * as Hero from './hero.js';
import {Asset} from './graphic';
import {DynamicPhysics} from './utils/box';
import {Entity, PhysicsEntity, Species} from './entity';
import {HeroSpecies} from './hero';

export default class State {
  hero: PhysicsEntity;
  entities: IdMap<Entity>;
  assets: IdMap<Asset>;
  species: IdMap<Species>;

  static fromJSON(json): State {
    const state = Object.assign(new State(), {
      assets: IdMap.fromJSON(json.assets),
      species: IdMap.fromJSON(json.species),
    });

    state.entities = IdMap.fromJSON(
      json.entities.map(entity => Entity.fromJSON(state, entity)),
    );

    state.hero = (state.entities.get(json.hero) as PhysicsEntity);
    state.hero.box = new DynamicPhysics(state.hero.box);

    return state;
  }
}

interface Identified {
  id: string;
}

class IdMap<T extends Identified> extends Map<string, T> {
  static fromJSON<T extends Identified>(json: T[]): IdMap<T> {
    return new IdMap(json.map(thing => [thing.id, thing]));
  }

  toJSON(): T[] {
    return Array.from(this.values());
  }
}
