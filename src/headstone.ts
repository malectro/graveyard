import * as p from './utils/point.js';
import {Graphic} from './utils/graphic.js';

export interface Type extends p.Point, Graphic {
  id: string;
  text: string;
}

export function create(props: Partial<Type>): Type {
  return {
    id: 'bad',
    text: 'some text',
    x: 0,
    y: 0,
    mesh: null,
    ...props,
  };
}