import * as Hero from './hero.js';
import * as Headstone from './headstone.js';

export interface State {
  hero: Hero.HeroType, 
  headstones: Map<string, Headstone.Type>,
}

function create(): State {
  return {
    hero: Hero.create(),
    headstones: new Map(),
  };
}

export default create;