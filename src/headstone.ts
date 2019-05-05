import * as p from './utils/point.js';

export interface Type extends p.Point {
  id: string;
  text: string;
}

export function create(props: Partial<Headstone>): Headstone {
  return {
    id: 'bad',
    text: 'some text',
    x: 0,
    y: 0,
    ...props,
  };
}