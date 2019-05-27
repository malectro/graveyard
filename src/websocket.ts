//import * as rxjs from 'rxjs';

import {WebSocketOutgoingMessage, WebSocketIncomingMessage} from './messages.js';
import * as p from './utils/point.js';
import {State} from './state.js';

export interface Socket {
  ws: WebSocket;
  domain: string;
}

export function start(domain: string, state: State): Socket {
  const socket = {
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
      } catch (error) {
        console.log('got un-parsable message', event);
        return;
      }

      switch (message.type) {
        case 'hero/view': {
          const {headstones, hero} = message.payload;
          for (const headstone of headstones) {
            if (!state.headstones.has(headstone.id)) {
              state.headstones.set(headstone.id, headstone);
            }
          }
          state.hero = hero;
        }
      }
    });

    const viewPingInterval = 1000;
    let getViewTimeoutId;

    function getView() {
      if (!document.hidden && socket.ws.readyState === WebSocket.OPEN) {
        sendMessage(socket, {type: 'hero/getView'});
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