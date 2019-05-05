import * as p from './utils/point.js';

interface Hero extends p.Point {
  id: string;
  name: string;
  speed: number;
  direction: p.Point;
  velocity: p.Point;
}

export function create(): Hero {
  return {
    id: '1',
    name: 'Kyle',
    x: 0,
    y: 0,
    speed: 10,
    direction: p.point(),
    velocity: p.point(),
  };
}

export function resolveVelocity(hero: Hero) {
  p.scale(p.normalize(p.set(hero.velocity, hero.direction)), hero.speed);
  return hero;
}
