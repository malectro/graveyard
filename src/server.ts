import {listenAndServe} from 'https://deno.land/std/http/server.ts';
import {acceptWebSocket, WebSocket} from 'https://deno.land/std/ws/mod.ts';

async function main() {
  const encoder = new TextEncoder();

  await listenAndServe(':8030', async req => {
    console.log('got request');
    try {
      const ws = await acceptWebSocket(req);
      console.log('upgraded connection');
      manageWebSocket(ws);
    } catch (error) {
      console.error('Error upgrading connection', error);
    }
  });
}

async function manageWebSocket(ws: WebSocket) {
  ws.send('hi kyle');
  for await (let event of ws.receive()) {
    console.log('got event', event);
    if (typeof event === 'string') {
      console.log('got websocket message', JSON.stringify(event));
    }
  }
}

main();