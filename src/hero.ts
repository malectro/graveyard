import * as p from './utils/point.js';
import {Graphic} from './utils/graphic.js';

export interface HeroType extends p.Point, Graphic {
  id: string;
  name: string;
  speed: number;
  direction: p.Point;
  velocity: p.Point;
  lastUpdate: number;
}

export function create(): HeroType {
  return {
    id: '1',
    name: 'Kyle',
    x: 0,
    y: 0,
    speed: 0.2,
    direction: p.point(),
    velocity: p.point(),
    lastUpdate: Date.now(),
    mesh: null,
  };
}

export function resolveVelocity(hero: HeroType) {
  //move(hero, Date.now());
  p.scale(p.normalize(p.set(hero.velocity, hero.direction)), hero.speed);
  return hero;
}

export function move(hero: HeroType, now: number): HeroType {
  const duration = now - hero.lastUpdate; 

  // TODO (kyle): not sure if the copy here is good for perf.
  p.add(
    hero,
    p.scale({...hero.velocity}, duration),
  );

  hero.lastUpdate = now;
  return hero;
}