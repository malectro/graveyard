import * as Hero from './hero.js';
import * as Headstone from './headstone.js';
import {Sprite} from './sprite.js';

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
