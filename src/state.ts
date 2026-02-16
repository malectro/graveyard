import {Asset} from './graphic';
import {Entity, PhysicsEntity, Species} from './entity';
import {DynamicPhysics, StaticPhysics, OverlayPhysics} from './physics';
import {AnimatedGraphic, StaticGraphic} from './graphic';
import ClassParser, {Parser} from './utils/class-parser';
import {Trigger} from './trigger';
import {IdMap} from './utils/id-map';
import {ChunkMap} from './chunk-map';
import {newId} from './utils/id';
import * as p from './utils/point';
import {TombstoneRecord, placeTombstone} from './api';

export default class State {
  // persistent data
  hero: PhysicsEntity;
  entities: ChunkMap;
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

    state.entities = new ChunkMap();
    const entities = json.entities.map(entity => Entity.fromJSON(state, {physics: physicsClassParser, graphic: graphicClassParser}, entity));
    for (const entity of entities) {
      state.entities.set(entity.id, entity);
    }

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

  createTombstoneEntity(record: TombstoneRecord): Entity {
    const asset = this.assets.get('1');
    const graphic = StaticGraphic.fromJSON(asset);
    const species = this.createSpecies({
      type: 'headstone',
      collides: true,
      triggerable: true,
      text: record.text,
    });
    const trigger = Trigger.fromJSON(this.triggers.get('1').toJSON());

    const entity = new Entity(
      record.id,
      new StaticPhysics(
        {x: record.position.x, y: record.position.y},
        {x: record.size.x, y: record.size.y},
      ),
      graphic,
      species,
      trigger,
    );
    entity.graphic.mesh.position.set(record.position.x, record.position.y);
    return entity;
  }

  placePlot(text: string): Entity | undefined {
    const {box} = this.futurePlot;
    if (box instanceof OverlayPhysics && box.isColliding(this)) {
      return;
    }

    const position = {x: box.position.x, y: box.position.y};
    const size = {x: box.size.x, y: box.size.y};
    const tempId = `local_${newId()}`;

    const record: TombstoneRecord = {id: tempId, position, size, text};
    const newPlot = this.createTombstoneEntity(record);
    this.entities.set(newPlot.id, newPlot);

    // Persist to server
    placeTombstone(position, text).then(serverRecord => {
      // Replace local entity with server-assigned ID
      this.entities.delete(tempId);
      const serverEntity = this.createTombstoneEntity(serverRecord);
      this.entities.set(serverEntity.id, serverEntity);
    }).catch(err => {
      console.error('Failed to persist tombstone:', err);
      this.entities.delete(tempId);
    });

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
