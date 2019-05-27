import * as WebSocket from 'ws';

import {WebSocketIncomingMessage, WebSocketOutgoingMessage} from './messages';
import * as Hero from './hero';
import * as Headstone from './headstone';


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
          headstones,
        },
      });
      break;

    case 'hero/move': {
      const hero = heroes[heroId];
      Hero.move(hero, Date.now());
      console.log('hero is at', hero.x, hero.y);
      hero.direction = message.payload;
      Hero.resolveVelocity(hero);
      break;
    }

    case 'hero/getView': {
      const now = Date.now();
      const hero = heroes[heroId];
      Hero.move(hero, now);
      sendMessage(ws, {
        type: 'hero/view',
        payload: {
          hero,
          headstones,
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

const heroId = '1';
let heroes = {
  '1': Hero.create(),
};

const headstones: Headstone.Type[] = [
  {id: '1', x: 0, y: 0, text: 'Here lies Kyle'},
  {id: '2', x: 50, y: 100, text: 'Here lies Kyle'},
  {id: '3', x: 300, y: 150, text: 'Here lies Kyle'},
];