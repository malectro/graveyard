//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js';
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js';
//import * as PIXI from 'pixi.js';
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

async function main() {
  const {hero, headstones} = state;

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
    const {hero, headstones} = state;

    // TODO (kyle): only do any of this if the hero is moving
    Hero.move(hero, now);
    heroMesh.position.set(hero.x, hero.y);
    view.focusCamera(hero);

    for (const [id, headstone] of state.headstones) {
      if (!headstone.mesh) {
        headstone.mesh = headstoneMeshPool.request();
        headstone.mesh.position.set(headstone.x, headstone.y);
        world.addChild(headstone.mesh);
      }

      // cull
      if (!view.isInLoadRange(headstone)) {
        world.removeChild(headstone.mesh);
        headstoneMeshPool.retire(headstone.mesh);
        state.headstones.delete(headstone.id);
      }
    }
  });

  const socket = ws.start('localhost:8030', state);
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
