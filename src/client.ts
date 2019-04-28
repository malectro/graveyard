//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js';
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js';
//import * as PIXI from 'pixi.js';

import {scale, repeat} from './utils/array.js';

interface Point {
  x: number;
  y: number;
}

  interface Headstone extends Point {
    id: string;
    text: string;
  }

  interface Hero extends Point {
    id: string,
    name: string,
  }

async function main() {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.view);

  const unitSquare = [0, 0, 1, 0, 1, 1, 0, 1];

  const headstoneGeometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', scale(unitSquare, 100), 2)
    .addIndex([0, 1, 2, 0, 3, 2]);

  const [vert, frag] = await Promise.all([
    fetch('shaders/2d.vert').then(response => response.text()),
    fetch('shaders/solidColor.frag').then(response => response.text()),
  ]);

  const solidColorProgram = PIXI.Program.from(vert, frag);
  const greenShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.5, 0.8, 0.5],
  });

  const world = new PIXI.Container();

  app.stage.addChild(world);

  const stones: Headstone[] = [
    {id: '1', x: 0, y: 0, text: 'Here lies Kyle'},
    {id: '2', x: 50, y: 100, text: 'Here lies Kyle'},
    {id: '3', x: 300, y: 150, text: 'Here lies Kyle'},
  ];

  const headstoneMeshes = stones.map(stone => {
    const headstoneMesh = new PIXI.Mesh(headstoneGeometry, greenShader);
    headstoneMesh.position.set(stone.x, stone.y);
    world.addChild(headstoneMesh);
    return headstoneMesh;
  });

  const hero: Hero = {
    id: '1',
    name: 'Kyle',
    x: 0,
    y: 0,
  };

  const heroMesh = new PIXI.Mesh(headstoneGeometry, greenShader);
  heroMesh.position.set(hero.x, hero.y);
  app.stage.addChild(heroMesh);
}

main();

/*
window.addEventListener('resize', () => {
  Object.assign(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
});
*/
