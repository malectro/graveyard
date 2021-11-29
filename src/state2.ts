import * as Hero from './hero.js';
import {Asset} from './graphic';
import {Entity, PhysicsEntity, Species} from './entity';
import {DynamicPhysics, StaticPhysics, OverlayPhysics} from './physics';
import {AnimatedGraphic, StaticGraphic} from './graphic';
import {HeroSpecies} from './hero';
import ClassParser, {Parser} from './utils/class-parser';
import {Trigger} from './trigger';
import {IdMap} from './utils/id-map';
import {newId} from './utils/id';
import * as p from './utils/point';

export default class State {
  // persistent data
  hero: PhysicsEntity;
  entities: IdMap<Entity>;
  assets: IdMap<Asset>;
  species: IdMap<Species>;
  triggers: IdMap<Trigger>;

  // ephemeral ui data
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

  setMode(mode: 'play' | 'edit') {
    this.mode = mode;
    if (mode === 'edit') {
      this.futurePlot = new Entity(
        'futurePlot',
        new OverlayPhysics(
          // TODO (kyle): position at center of screen
          {x: 0, y: 0},
          {x: 128, y: 128},
        ),
        // TODO (kyle): using headstone graphic here
        StaticGraphic.fromJSON(this.assets.get('1')),
        // TODO (kyle): don't use grass for this?
        this.species.get('2'),
      );
      this.futurePlot.graphic.mesh.alpha = 0.5;
      this.entities.set(this.futurePlot.id, this.futurePlot);
    } else {
      this.entities.delete(this.futurePlot.id);
      this.futurePlot = null;
    }
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
      {
        id: newId(),
        collides: true,
        triggers: true,
        text,
      },
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
