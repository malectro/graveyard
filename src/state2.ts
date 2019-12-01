import * as Hero from './hero.js';
import {Asset} from './graphic';
import {Entity, Species} from './entity';

export default class State {
  hero: Hero.HeroType;
  entities: IdMap<Entity>;
  assets: IdMap<Asset>;
  species: IdMap<Species>;

  static fromJSON(json): State {
    const state = Object.assign(new State(), {
      hero: Hero.create(),
      assets: IdMap.fromJSON(json.assets),
      species: IdMap.fromJSON(json.species),
    });

    state.entities = IdMap.fromJSON(json.entities.map(entity => Entity.fromJSON(state, entity)));

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
