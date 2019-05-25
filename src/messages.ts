import * as p from './utils/point.ts';
import * as Hero from './hero.ts';
import * as Headstone from './headstone.ts';

interface WebSocketMessageSimple<T extends string> {
  type: T;
};
interface WebSocketMessage<T extends string, P> {
  type: T;
  payload: P;
};

export type HeroAppearMessage = WebSocketMessageSimple<'hero/appear'>;
export type HeroMoveMessage = WebSocketMessage<'hero/move', p.Point>;
export type HeroGetViewMessage = WebSocketMessageSimple<'hero/getView'>; 
export type WebSocketIncomingMessage = HeroAppearMessage | HeroMoveMessage | HeroGetViewMessage;

export type HeroLocationMessage = WebSocketMessage<'hero/location', Hero.HeroType>;
export type HeroViewMessage = WebSocketMessage<'hero/view', {hero: Hero.HeroType, headstones: Headstone.Type[]}>; 
export type WebSocketOutgoingMessage =  HeroLocationMessage | HeroViewMessage;