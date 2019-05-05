import * as PointMath from './utils/point.js';

import * as Hero from './hero.js';

export function init(hero: Hero.HeroType) {
  const keys = {
    ArrowDown: {x: 0, y: 1},
    ArrowUp: {x: 0, y: -1},
    ArrowRight: {x: 1, y: 0},
    ArrowLeft: {x: -1, y: 0},
  };

  const currentKeys = new Set();

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      const key = keys[event.key];

      if (key) {
        event.preventDefault();

        if (!currentKeys.has(event.key)) {
          currentKeys.add(event.key);

          PointMath.add(hero.direction, key);
          Hero.resolveVelocity(hero);
        }
      }
    },
    {capture: true},
  );

  window.addEventListener(
    'keyup',
    event => {
      const key = keys[event.key];

      if (key) {
        event.preventDefault();

        if (currentKeys.has(event.key)) {
          currentKeys.delete(event.key);
          PointMath.subtract(hero.direction, key);
          Hero.resolveVelocity(hero);
        }
      }
    },
    {capture: true},
  );
}
