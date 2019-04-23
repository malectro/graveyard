import {createElement} from './utils/dom.js';

const canvas: HTMLCanvasElement = createElement(document, 'canvas', {
  width: window.innerWidth,
  height: window.innerHeight,
  style: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'black',
  },
});

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 20, 20);

document.body.appendChild(canvas);

window.addEventListener('resize', () => {
  Object.assign(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
});