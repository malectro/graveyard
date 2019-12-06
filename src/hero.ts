import * as p from './utils/point.js';
import {intersectSegment} from './utils/box';
import {Graphic} from './utils/graphic.js';
import {reduce} from './utils/iterable';
import {Sprite} from './sprite';
import {PhysicsBox} from './utils/box';
import {Entity, PhysicsEntity, Species} from './entity';


export class HeroSpecies implements Species {
  readonly collides = true;
  constructor(readonly id: string, readonly name: string = 'New Hero') {}

  static fromJSON(json): HeroSpecies {
    const species = new HeroSpecies(json.id, json.name);
    return species;
  }
}

export interface HeroType extends p.Point, Graphic {
  id: string;
  name: string;
  speed: number;
  direction: p.Point;
  velocity: p.Point;
  futurePosition: p.Point;
  lastUpdate: number;
}

export function create(): HeroType {
  return {
    id: '1',
    name: 'Kyle',
    x: 0,
    y: 0,
    speed: 0.5,
    direction: p.point(),
    velocity: p.point(),
    futurePosition: p.point(),
    lastUpdate: Date.now(),
    mesh: null,
  };
}

export function resolveVelocity(box: PhysicsBox) {
  p.scale(p.normalize(p.set(box.velocity, box.direction)), box.speed);
  return box;
}

export function isMoving(hero: PhysicsBox): boolean {
  return !p.isZero(hero.velocity);
}

export function move(box: PhysicsBox, entities: IterableIterator<Entity>, now: number) {
  console.log('moving');
  const duration = now - box.lastUpdate;
  const travelVector = 
    p.scale({...box.velocity}, duration);

  p.add(
    p.set(box.futurePosition, box.position),
    travelVector,
  );

  const intersection = reduce(entities, (info, entity) => {
    const point = intersectSegment(entity.box, box.position, box.futurePosition);
    if (point) {
      const distance = p.cheapDistance(box.position, point);
      if (distance < info.d) {
        info.d = distance;
        info.p = point;
      }
    }
    return info;
  }, {d: Infinity, p: null});

  if (intersection.p) {
    p.add(p.set(box.position, intersection.p), p.scale(travelVector, -0.1));
  } else {
    p.set(box.position, box.futurePosition);
  }

  box.lastUpdate = now;
}
