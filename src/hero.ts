import * as PointMath from './utils/point.js';

interface Hero extends PointMath.Point {
  id: string;
  name: string;
  speed: number;
  direction: PointMath.Point;
  velocity: PointMath.Point;
}

export const hero: Hero = {
  id: '1',
  name: 'Kyle',
  x: 0,
  y: 0,
  speed: 10,
  direction: PointMath.point(),
  velocity: PointMath.point(),
};

export function resolveVelocity(hero: Hero) {
  PointMath.scale(
    PointMath.normalize(PointMath.set(hero.velocity, hero.direction)),
    hero.speed,
  );
  return hero;
}