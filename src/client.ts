//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js';
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js';
import * as PIXI from 'pixi.js';
import {Observable} from 'rxjs';
//import {Observable} from 'https://raw.githubusercontent.com/ReactiveX/rxjs/master/src/index.ts';

import {scale, repeat} from './utils/array.js';
import * as p from './utils/point.js';

import createState from './state.js';
import * as Hero from './hero.js';
import * as Headstone from './headstone.js';
import View from './view.js';
import * as Controls from './controls.js';
import * as ws from './websocket.js';
import Pool from './utils/pool.js';

const state = createState();

(<any>window).__state = state;

async function main() {
  const {hero, headstones, sprites} = state;

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

  const greenShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.5, 0.8, 0.5],
  });
  const pinkShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.8, 0.5, 0.5],
  });

  const heroMesh = new PIXI.Mesh(headstoneGeometry, pinkShader);
  heroMesh.position.set(hero.x, hero.y);
  app.stage.addChild(heroMesh);

  view.setCameraPosition(hero);

  //const headstoneMeshMap = new WeakMap();
  const headstoneMap = new Map();

  app.ticker.add(_delta => {
    const now = Date.now();
    const {hero, headstones, sprites} = state;

    // TODO (kyle): only do any of this if the hero is moving
    Hero.move(hero, now);
    heroMesh.position.set(hero.x, hero.y);
    view.focusCamera(hero);

    for (const [id, sprite] of state.sprites) {
      if (!sprite.mesh) {
        console.log('adding', sprite.id);
        sprite.mesh = headstoneMeshPool.request();
        sprite.mesh.position.set(sprite.x, sprite.y);
        world.addChild(sprite.mesh);
      }

      // cull
      if (!view.isInLoadRange(sprite)) {
        console.log('culling', sprite.id);
        world.removeChild(sprite.mesh);
        headstoneMeshPool.retire(sprite.mesh);
        state.sprites.delete(sprite.id);
      }
    }
  });

  const socket = ws.start('localhost:8030', state, view);
  Controls.init(state, socket);

  const headstoneMeshPool = new Pool(
    () => (
      new PIXI.Mesh(headstoneGeometry, greenShader)
    ),
  );
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
