import * as p from './utils/point.ts';
import {Graphic} from './utils/graphic.ts';

export interface HeroType extends p.Point, Graphic {
  id: string;
  name: string;
  speed: number;
  friction: number;
  acceleration: p.Point;
  direction: p.Point;
  velocity: p.Point;
  futurePosition: p.Point;
  lastUpdate: number;
}
