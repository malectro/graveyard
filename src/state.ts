import * as Hero from './hero.ts';
import * as Headstone from './headstone.ts';
import {Sprite} from './sprite.ts';

export interface State {
  hero: Hero.HeroType, 
  headstones: Map<string, Headstone.Type>,
  sprites: Map<string, Sprite>,
}

function create(): State {
  return {
    hero: Hero.create(),
    headstones: new Map(),
    sprites: new Map(),
  };
}

export default create;
