import * as PIXI from 'pixi.js';

import stateJson from './data/state.ts';
import State from './state2.ts';
import {loadShaders} from './graphic.ts';
import View from './view.ts';
import {
  ExplorationController,
  GlobalInput,
  adaptBrowserController,
} from './controls.ts';
import * as ws from './websocket.ts';
import Pool from './utils/pool.ts';
import {init as initUi} from './ui.ts';
import {setGame, Game} from './game.ts'

async function main(): Promise<void> {
  await loadShaders();

  const game: Game = new Game();
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
  game.pixi = app;

  const view = new View(app, {cameraPaddingPercentage: 0.2});

  const world = new PIXI.Container();
  game.world = world;
  game.view = view;

  const {hero} = state2;
  state2.focus = hero;
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
    const {hero, focus} = state2;

    //hero.tick(state2, now, delta);

    for (const entity of state2.entities.values()) {
      entity.tick(state2, now, delta);
    }

    if (focus != null) {
      view.focusCamera(focus.box.position);
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

  const socket = ws.start('localhost:8030', state2, view);
	game.socket = socket;
  //Controls.init(state, socket);
	
  const globalInput = new GlobalInput();
  globalInput.setController(
    new ExplorationController(game, socket),
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
