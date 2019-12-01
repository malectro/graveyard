import * as WebSocket from 'ws';

import {WebSocketIncomingMessage, WebSocketOutgoingMessage} from './messages';
import * as Hero from './hero';
import * as Headstone from './headstone';
import * as p from './utils/point';
import {Sprite} from './sprite';
import {entities} from './entities';


const wss = new WebSocket.Server({ port: 8030 });

wss.on('connection', (ws) => {
  ws.on('message', (string) => {
    console.log('got message', string);
    try {
      const message = JSON.parse(string);
      handleMessage(ws, message);
    } catch (error) {
      console.log('failed to parse message');
      return;
    }
  });
});

console.log('Listening');

async function handleMessage(ws: WebSocket, message: WebSocketIncomingMessage) {
  switch (message.type) {
    case 'hero/appear':
      sendMessage(ws, {
        type: 'hero/view',
        payload: {
          hero: heroes[heroId],
          sprites: [],
        },
      });
      break;

    case 'hero/move': {
      const hero = heroes[heroId];
      Hero.move(hero, entities.values(), Date.now());
      console.log('hero is at', hero.x, hero.y);
      hero.direction = message.payload;
      Hero.resolveVelocity(hero);
      break;
    }

    case 'hero/getView': {
      const {position, size} = message.payload;
      const now = Date.now();
      const hero = heroes[heroId];
      Hero.move(hero, entities.values(), now);
      sendMessage(ws, {
        type: 'hero/view',
        payload: {
          hero,
          sprites: getSpritesInView(position, size),
        },
      });
      break;
    }
  }
}

function sendMessage(ws: WebSocket, message: WebSocketOutgoingMessage) {
  //console.log('sending message', message);
  ws.send(JSON.stringify(message));
}

function getHeadstonesInView(viewPoint: p.Point, viewSize: p.Point) {
  // TODO (kyle): this should be geo indexed
  return headstones.filter(headstone => p.isInBox(headstone, viewPoint, viewSize));
}

function getSpritesInView(viewPoint: p.Point, viewSize: p.Point) {
  // TODO (kyle): this should be geo indexed
  return entities.filter(sprite => p.isInBox(sprite, viewPoint, viewSize));
}

const heroId = '1';
let heroes = {
  '1': Hero.create(),
};

const headstones: Headstone.Type[] = [
];
