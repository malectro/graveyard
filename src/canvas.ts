import {createElement} from './utils/dom.js';

export const canvas: HTMLCanvasElement = createElement(document, 'canvas', {
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

document.body.appendChild(canvas);