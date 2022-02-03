import { listenAndServe } from "./deps.ts";

import * as Hero from "../hero.ts";
import * as p from "../utils/point.ts";
import * as Headstone from "../headstone.ts";
import {
  WebSocketIncomingMessage,
  WebSocketOutgoingMessage,
} from "../messages.ts";

async function main() {
  await listenAndServe({ port: ":8030" }, async (req: Request) => {
    console.log("got request");
    try {
      const wsReq = Deno.upgradeWebSocket(req);
      console.log("upgraded connection");
      manageWebSocket(wsReq.socket);
      return wsReq.response;
    } catch (error) {
      console.error("Error upgrading connection", error);
      return new Response("Failed to upgrade to websocket.");
    }
  });
}
main();

function manageWebSocket(ws: WebSocket) {
  /*
  const iterator = ws.receive();

  while (true) {
    const {done, value} = await iterator.next();
    if (done) {
      console.log('done');
      break;
    }
    console.log('got event', value);
  }
  */
  ws.addEventListener("message", (event: MessageEvent) => {
    const data = event.data;
    if (typeof data === "string") {
      try {
        const message = JSON.parse(data);
        console.log("got message", message);
        handleMessage(ws, message);
      } catch (_error) {
        console.warn(
          "could not parse websocket string event",
          JSON.stringify(event),
        );
      }
    }
  });
}

function handleMessage(ws: WebSocket, message: WebSocketIncomingMessage) {
  switch (message.type) {
    case "hero/appear":
      sendMessage(ws, {
        type: "hero/view",
        payload: {
          hero: heroes[heroId],
          headstones,
        },
      });
      break;

    case "hero/move": {
      const hero = heroes[heroId];
      hero.direction = message.payload;
      Hero.resolveVelocity(hero);
      break;
    }

    case "hero/getView": {
      const now = Date.now();
      const hero = heroes[heroId];
      Hero.move(hero, now);
      sendMessage(ws, {
        type: "hero/view",
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
  ws.send(JSON.stringify(message));
}

const heroId = "1";
let heroes = {
  "1": Hero.create(),
};

const headstones: Headstone.Type[] = [
  { id: "1", x: 0, y: 0, text: "Here lies Kyle" },
  { id: "2", x: 50, y: 100, text: "Here lies Kyle" },
  { id: "3", x: 300, y: 150, text: "Here lies Kyle" },
];