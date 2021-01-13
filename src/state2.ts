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

  static async fromJSON(json): Promise<State> {
    const physicsClassParser = new ClassParser([StaticPhysics, DynamicPhysics]);
    const graphicClassParser = new ClassParser([AnimatedGraphic, StaticGraphic]);

    const images = await Promise.all(
      json.assets.map(
        asset => Array.isArray(asset.src) ? Promise.all(asset.src.map(loadImage)) : loadImage(asset.src),
      ),
    ).catch(error => {
      console.error(error);
    });

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

function loadImage(src: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);

    image.src = `/assets/${src}`;
  });
}
