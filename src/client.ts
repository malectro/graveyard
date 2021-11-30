import * as PIXI from 'pixi.js';
import * as React from 'react';
import {render} from 'react-dom';

import stateJson from './data/state';
import State from './state2';
import {loadShaders} from './graphic';
import View from './view';
import {
  ExplorationController,
  PlacementController,
  GlobalInput,
  adaptBrowserController,
} from './controls';
import * as ws from './websocket';
import Pool from './utils/pool';
import {init as initUi} from './ui';
import {getGame, setGame, Game} from './game'

import UiApp from './ui/app';
import EpitaphDialog from './ui/EpitaphDialog';

async function main(): Promise<void> {
  await loadShaders();

  let game: Game = {};
  setGame(game);

  const state2 = ((window as any).state = await State.fromJSON(stateJson));
  game.state = state2;

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
  game.world = world;

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

    //hero.tick(state2, now, delta);

    for (const entity of state2.entities.values()) {
      entity.tick(state2, now, delta);
    }

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
  const globalInput = new GlobalInput();
  globalInput.setController(
    new ExplorationController(state2, null),
    adaptBrowserController,
  );

  game.globalInput = globalInput;

  game.ui = initUi(game);
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
