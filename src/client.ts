import * as PIXI from 'pixi.js';

import stateJson from './data/state';
import State from './state2';
import {loadShaders} from './graphic';
import View from './view';
import * as Controls from './controls';
import * as ws from './websocket';
import Pool from './utils/pool';

async function main(): Promise<void> {
  await loadShaders();

  const state2 = (window as any).state = await State.fromJSON(stateJson);
  console.log('state', state2);

  //(<any>window).__state2 = state2;

  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.view);

  const view = new View(app, {cameraPaddingPercentage: 0.2});

  const world = new PIXI.Container();

  const {hero} = state2;
  for (const entity of state2.entities.values()) {
    if (entity !== hero) {
      console.log('adding', entity, entity.graphic.mesh);
      world.addChild(entity.graphic.mesh);
    }
  }
  app.stage.addChild(world);
  app.stage.addChild(hero.graphic.mesh);

  view.setCameraPosition(hero.graphic.mesh.position);

  app.ticker.add(delta => {
    const now = Date.now();
    const {hero} = state2;

    hero.tick(state2, now, delta);
    view.focusCamera(hero.box.position);

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
