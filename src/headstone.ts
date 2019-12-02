import * as Sprite from './sprite.js';
import {Species} from './entity';

export interface Type extends Sprite.Sprite {
  type: 'headstone';
  data: {
    text: string;
  },
}

export function create(props?: Partial<Type>): Type {
  return Object.assign(
    Sprite.create('headstone'),
    {
      data: {
        text: 'some text',
      },
      ...props,
    },
  );
}

export class Headstone implements Species {

}
