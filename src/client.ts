//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js';
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js';
import * as PIXI from 'pixi.js';
import {Observable} from 'rxjs';
//import {Observable} from 'https://raw.githubusercontent.com/ReactiveX/rxjs/master/src/index.ts';

import {scale, repeat} from './utils/array.js';
import * as p from './utils/point.js';

import stateJson from './data/state';
import State from './state2';
import {loadShaders} from './graphic';
import {entities} from './entities';
import createState from './state.js';
import * as Hero from './hero.js';
import * as Headstone from './headstone.js';
import View from './view.js';
import * as Controls from './controls.js';
import * as ws from './websocket.js';
import Pool from './utils/pool.js';

const state = createState();

//(<any>window).__state = state;

state.sprites = new Map(entities.map(entity => [entity.id, entity]));

async function main() {
  await loadShaders();

  const state2 = State.fromJSON(stateJson);
  console.log('state', state2);

  //(<any>window).__state2 = state2;
  //const {hero, headstones, sprites} = state;

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

  const {hero} = state2;
  for (const entity of state2.entities.values()) {
    if (entity !== hero) {
      console.log('adding', entity, entity.graphic.mesh);
      world.addChild(entity.graphic.mesh);
    }
  }
  app.stage.addChild(hero.graphic.mesh);
  app.stage.addChild(world);

  const greenShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.5, 0.8, 0.5],
  });
  const pinkShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.8, 0.5, 0.5],
  });

  view.setCameraPosition(hero.graphic.mesh.position);

  app.ticker.add(_delta => {
    const now = Date.now();
    const {hero, entities} = state2;

    //console.log('velocity', hero.box.velocity.x, hero.box.velocity.y);
    if (Hero.isMoving(hero.box)) {
      Hero.move(hero.box, entities.values(), now);
      hero.graphic.mesh.position.set(hero.box.position.x, hero.box.position.y);
      view.focusCamera(hero.box.position);
    }

      /*
    for (const [id, entity] of entities) {
      // cull
      if (!view.isInLoadRange(sprite)) {
        console.log('culling', sprite.id);
        world.removeChild(sprite.mesh);
        headstoneMeshPool.retire(sprite.mesh);
        state.sprites.delete(sprite.id);
      }
    }
       */
  });

  // TODO (kyle): use websocket
  //const socket = ws.start('localhost:8030', state, view);
  //Controls.init(state, socket);
  Controls.init(state2);
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
