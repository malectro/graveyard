import {WebSocketOutgoingMessage, WebSocketIncomingMessage} from './messages';
import * as p from './utils/point';

interface Socket {
  ws: WebSocket;
  domain: string;
}

export function start(domain: string, data): Socket {
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

    rxjs.fromEvent(ws, 'message').forEach((message: WebSocketOutgoingMessage) => {
      switch (message.type) {
        case 'hero/view': {
          const {headstones, hero} = message.payload;
          data.headstones = headstones; 
          data.hero = hero;
        }
      }
    });

    const viewPingInterval = 1000;
    let getViewTimeoutId = 0;

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