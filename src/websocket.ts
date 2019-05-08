export function start(url: string) {
  const socket = {
    ws: null,
    url,
  };

  function open() {
    console.log('opening websocket');
    const ws = new WebSocket('ws://localhost:8030');

    ws.addEventListener('open', () => {
      console.log("opened");
      ws.send('it worked!');

      const encoder = new TextEncoder();
      ws.send(encoder.encode('it worked!'));
    });

    ws.addEventListener('message', message => console.log('got message'));

    ws.addEventListener('error', error => {
      console.error(error);
    });

    ws.addEventListener('close', () => {});

    socket.ws = ws;
  }

  open();

  return socket;
}
