import * as Hero from './hero.ts';
import {Asset} from './graphic.ts';
import {Entity, PhysicsEntity, Species} from './entity.ts';
import {DynamicPhysics, StaticPhysics, OverlayPhysics} from './physics.ts';
import {AnimatedGraphic, StaticGraphic} from './graphic.ts';
import {HeroSpecies} from './hero.ts';
import ClassParser, {Parser} from './utils/class-parser.ts';
import {Trigger} from './trigger.ts';
import {IdMap} from './utils/id-map.ts';
import {newId} from './utils/id.ts';
import * as p from './utils/point.ts';

export default class State {
  // persistent data
  hero: PhysicsEntity;
  entities: IdMap<Entity>;
  assets: IdMap<Asset>;
  species: IdMap<Species>;
  triggers: IdMap<Trigger>;

  // ephemeral ui data
  focus: Entity | null;
  mode: 'play' | 'edit';
  futurePlot: Entity;
  dialog: React.ReactNode | null = null;

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

  createSpecies(props): Species {
    const species = {
      id: newId(),
      ...props,
    };

    this.species.set(species.id, species);

    return species;
  }

  placePlot(text: string): Entity | undefined {
    const {box} = this.futurePlot;
    if (box instanceof OverlayPhysics && box.isColliding(this)) {
      return;
    }

    const newPlot = new Entity(
      newId(),
      new StaticPhysics(
        p.copy(box.position),
        p.copy(box.size),
      ),
      this.futurePlot.graphic.copy(),
      // TODO (kyle): are species right for collision?
      this.createSpecies({
        collides: true,
        triggers: true,
        text,
      }),
      Trigger.fromJSON(this.triggers.get('1').toJSON()),
    );

    this.entities.set(newPlot.id, newPlot);

    return newPlot;
  }
}

function loadImage(src: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);

    image.src = `assets/${src}`;
  });
}
