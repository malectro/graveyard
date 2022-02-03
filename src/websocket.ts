import * as rxjs from 'rxjs';

import {WebSocketOutgoingMessage, WebSocketIncomingMessage} from './messages.ts';
import * as p from './utils/point.ts';
import State from './state2.ts';
import View from './view.ts';

export interface Socket {
  ws: WebSocket;
  domain: string;
}

export function start(domain: string, state: State, view: View): Socket {
  const socket: Socket = {
    ws: null,
    domain,
  };

  function open() {
    console.log('opening websocket');
    const ws = new WebSocket(`ws://${domain}`);
    socket.ws = ws;

    ws.addEventListener('open', () => {
      sendMessage(socket, {
        type: 'hero/appear',
      });
      getView();
    });

    ws.addEventListener('error', error => {
      console.error(error);
    });

    ws.addEventListener('close', () => {
      console.log('connection was closed.');
    });

    rxjs.fromEvent(ws, 'message').forEach((event: MessageEvent) => {
      let message;

      try {
        message = <WebSocketOutgoingMessage>JSON.parse(event.data); 
      } catch (_error) {
        console.log('got un-parsable message', event);
        return;
      }

      switch (message.type) {
        case 'hero/view': {
          const {sprites, hero} = message.payload;
          for (const sprite of sprites) {
            if (!state.sprites.has(sprite.id)) {
              state.sprites.set(sprite.id, sprite);
            }
          }
          //state.hero = hero;
        }
      }
    });

    const viewPingInterval = 1000;
    let getViewTimeoutId;

    function getView() {
      if (!document.hidden && socket.ws.readyState === WebSocket.OPEN) {
        sendMessage(socket, {type: 'hero/getView', payload: view.getViewBox()});
        getViewTimeoutId = setTimeout(getView, viewPingInterval);
      }
    }

    rxjs.fromEvent(document, 'visibilitychange').forEach(() => {
      if (!document.hidden) {
        clearTimeout(getViewTimeoutId);
        getView();
      }
    });
  }

  open();

  return socket;
}

export function sendMessage(socket: Socket, message: WebSocketIncomingMessage) {
  socket.ws.send(JSON.stringify(message));
}
