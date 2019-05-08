//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js';
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js';
//import * as PIXI from 'pixi.js';
//import {Observable} from 'https://raw.githubusercontent.com/ReactiveX/rxjs/master/src/index.ts';

import {scale, repeat} from './utils/array.js';
import * as p from './utils/point.js';

import * as Hero from './hero.js';
import * as Headstone from './headstone.js';
import View from './view.js';
import * as Controls from './controls.js';
import * as ws from './websocket.js';


const hero = Hero.create();

async function main() {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.view);

  const view = new View(app, {cameraPaddingPercentage: 0.2});

  const unitSquare = [-1, -1, 1, -1, 1, 1, -1, 1];

  const headstoneGeometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', scale(unitSquare, 50), 2)
    .addIndex([0, 1, 2, 0, 3, 2]);

  const [vert, frag] = await Promise.all([
    fetch('shaders/2d.vert').then(response => response.text()),
    fetch('shaders/solidColor.frag').then(response => response.text()),
  ]);

  const solidColorProgram = PIXI.Program.from(vert, frag);

  const world = new PIXI.Container();

  app.stage.addChild(world);

  const stones: Headstone.Type[] = [
    {id: '1', x: 0, y: 0, text: 'Here lies Kyle'},
    {id: '2', x: 50, y: 100, text: 'Here lies Kyle'},
    {id: '3', x: 300, y: 150, text: 'Here lies Kyle'},
  ];

  const greenShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.5, 0.8, 0.5],
  });
  const headstoneMeshes = stones.map(stone => {
    const headstoneMesh = new PIXI.Mesh(headstoneGeometry, greenShader);
    headstoneMesh.position.set(stone.x, stone.y);
    world.addChild(headstoneMesh);
    return headstoneMesh;
  });

  const pinkShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.8, 0.5, 0.5],
  });
  const heroMesh = new PIXI.Mesh(headstoneGeometry, pinkShader);
  heroMesh.position.set(hero.x, hero.y);
  app.stage.addChild(heroMesh);

  view.setCameraPosition(hero);

  app.ticker.add(_delta => {
    // TODO (kyle): only do any of this if the hero is moving
    p.add(hero, hero.velocity);
    heroMesh.position.set(hero.x, hero.y);
    view.focusCamera(hero);
  });

  Controls.init(hero);

  ws.start('');
}

main();

/*
*/

/*
window.addEventListener('resize', () => {
  Object.assign(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
});
*/
