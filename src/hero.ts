import * as p from './utils/point.ts';
import {HeroType} from './hero.type.ts';
import {PhysicsBox} from './utils/box.ts';
import {PhysicsEntity, Species} from './entity.ts';


export class HeroSpecies implements Species {
  readonly collides = true;
  constructor(readonly id: string, readonly name: string = 'New Hero') {}

  static fromJSON(json): HeroSpecies {
    const species = new HeroSpecies(json.id, json.name);
    return species;
  }
}

export class Hero {
  constructor(public entity: PhysicsEntity) {}

  activateTargetEntity() {
    const lastHitEntity = this.entity.box.lastHitEntity;

    if (lastHitEntity) {
    }
  }
}

export function create(): HeroType {
  return {
    id: '1',
    name: 'Kyle',
    x: 0,
    y: 0,
    speed: 1,
    friction: 0.5,
    acceleration: p.point(),
    direction: p.point(),
    velocity: p.point(),
    futurePosition: p.point(),
    lastUpdate: Date.now(),
    mesh: null,
  };
}

export function resolveVelocity(box: PhysicsBox): PhysicsBox {
  p.scale(p.normalize(p.set(box.acceleration, box.direction)), box.speed);
  return box;
}
