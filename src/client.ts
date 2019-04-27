//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js'; 
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js'; 
//import * as PIXI from 'pixi.js';

const app = new PIXI.Application();
document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();
graphics.beginFill(0xaaaaaa);
graphics.drawRect(20, 20, 100, 100);
graphics.endFill();

app.stage.addChild(graphics);

interface Headstone {
  x: number,
  y: number,
  text: string,
};

const stones: Headstone[] = [
  {x: 0, y: 0, text: 'Here lies Kyle'},
];

function paint() {
}

/*
window.addEventListener('resize', () => {
  Object.assign(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
});
*/