import * as PIXI from 'pixi.js';
import State from './state2';
import {GlobalInput} from './controls';
import {UI} from './ui';

export interface Game {
  world: PIXI.Container;
  state: State;
  globalInput: GlobalInput;
  ui: UI;
}


let _game;

export function setGame(game: Game) {
  _game = game;
}

export function getGame(): Game {
  return _game;
}
