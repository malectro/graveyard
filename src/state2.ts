import * as Hero from './hero.js';
import {Asset} from './graphic';
import {Entity, PhysicsEntity, Species} from './entity';
import {DynamicPhysics, StaticPhysics} from './physics';
import {AnimatedGraphic, StaticGraphic} from './graphic';
import {HeroSpecies} from './hero';
import ClassParser, {Parser} from './utils/class-parser';
import {Trigger} from './trigger';
import {IdMap} from './utils/id-map';

export default class State {
  hero: PhysicsEntity;
  entities: IdMap<Entity>;
  assets: IdMap<Asset>;
  species: IdMap<Species>;
  triggers: IdMap<Trigger>;

  static fromJSON(json): State {
    const physicsClassParser = new ClassParser([StaticPhysics, DynamicPhysics]);
    const graphicClassParser = new ClassParser([AnimatedGraphic, StaticGraphic]);

    const state = Object.assign(new State(), {
      assets: IdMap.fromJSON(json.assets),
      species: IdMap.fromJSON(json.species),
      triggers: IdMap.fromJSON(
        json.triggers.map(trigger => Trigger.fromJSON(trigger)),
      ),
    });

    state.entities = IdMap.fromJSON(
      json.entities.map(entity => Entity.fromJSON(state, {physics: physicsClassParser, graphic: graphicClassParser}, entity)),
    );

    state.hero = (state.entities.get(json.hero) as PhysicsEntity);

    return state;
  }
}
