import * as p from './utils/point.js';

export interface HeroType extends p.Point {
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
    speed: 10,
    direction: p.point(),
    velocity: p.point(),
    lastUpdate: Date.now(),
  };
}

export function resolveVelocity(hero: HeroType) {
  p.scale(p.normalize(p.set(hero.velocity, hero.direction)), hero.speed);
  return hero;
}

export function move(hero: HeroType, now: number): HeroType {
  const duration = now - hero.lastUpdate; 

  // TODO (kyle): not sure if the copy here is good for perf.
  p.add(
    hero,
    p.scale({...hero.velocity}, hero.speed * duration),
  );

  hero.lastUpdate = now;
  return hero;
}