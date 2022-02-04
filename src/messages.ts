import * as p from './utils/point.ts';

interface WebSocketMessageSimple<T extends string> {
  type: T;
}
interface WebSocketMessage<T extends string, P> {
  type: T;
  payload: P;
}

export type HeroAppearMessage = WebSocketMessageSimple<'hero/appear'>;
export type HeroMoveMessage = WebSocketMessage<'hero/move', p.Point>;
export type HeroGetViewMessage = WebSocketMessage<'hero/getView', {
  position: p.Point;
  size: p.Point;
}>;
export type WebSocketIncomingMessage =
  | HeroAppearMessage
  | HeroMoveMessage
  | HeroGetViewMessage;

export type HeroLocationMessage = WebSocketMessage<
  'hero/location',
	null
>;
export type HeroViewMessage = WebSocketMessage<
  'hero/view',
	null
>;
export type WebSocketOutgoingMessage = HeroLocationMessage | HeroViewMessage;
