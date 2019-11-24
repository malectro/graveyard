import * as p from './utils/point.js';
import {Graphic} from './utils/graphic.js';


export interface Sprite extends p.Point, Graphic {
  id: string;
  type: string;
  data?: unknown;
}

export function create(type: string, props?: Partial<Sprite>): Sprite {
  return {
    id: 'bad',
    type,
    x: 0,
    y: 0,
    mesh: null,
    data: null,
    ...props,
  };
}
