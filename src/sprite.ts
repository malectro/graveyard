import * as p from './utils/point.ts';
import {Graphic} from './utils/graphic.ts';


export interface Sprite extends p.Point, Graphic {
  id: string;
  type: string;
  data?: unknown;
  width: number;
  height: number;
}

export function create(type: string, props?: Partial<Sprite>): Sprite {
  return {
    id: 'bad',
    type,
    x: 0,
    y: 0,
    mesh: null,
    data: null,
    width: SpriteSize.x,
    height: SpriteSize.y,
    ...props,
  };
}

export const SpriteSize = {
  x: 50, y: 50,
};
