import * as p from './utils/point.js';
import {intersectSegment} from './utils/box';
import {Graphic} from './utils/graphic.js';
import {reduce} from './utils/iterable';
import {Sprite} from './sprite';
import {Entity} from './entity';

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

export function resolveVelocity(hero: HeroType) {
  //move(hero, Date.now());
  p.scale(p.normalize(p.set(hero.velocity, hero.direction)), hero.speed);
  return hero;
}

export function isMoving(hero: HeroType): boolean {
  return !p.isZero(hero.velocity);
}

export function move(hero: HeroType, entities: IterableIterator<Entity>, now: number): HeroType {
  const duration = now - hero.lastUpdate;
  const travelVector = 
    p.scale({...hero.velocity}, duration);

  p.add(
    p.set(hero.futurePosition, hero),
    travelVector,
  );

  const intersection = reduce(entities, (info, entity) => {
    const point = intersectSegment(entity.box, hero, hero.futurePosition);
    if (point) {
      const distance = p.cheapDistance(hero, point);
      if (distance < info.d) {
        info.d = distance;
        info.p = point;
      }
    }
    return info;
  }, {d: Infinity, p: null});

  if (intersection.p) {
    p.add(p.set(hero, intersection.p), p.scale(travelVector, -0.1));
  } else {
    p.set(hero, hero.futurePosition);
  }

  hero.lastUpdate = now;
  return hero;
}
