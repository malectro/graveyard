import * as PIXI from 'pixi.js';

import stateJson from './data/state';
import State from './state';
import {loadShaders} from './graphic';
import View from './view';
import {
  ExplorationController,
  GlobalInput,
  adaptBrowserController,
} from './controls';
import {init as initUi} from './ui';
import {setGame, Game} from './game';

async function main(): Promise<void> {
  await loadShaders();

  let game: Game = new Game();
  setGame(game);

  const state2 = await State.fromJSON(stateJson);
  game.state = state2;

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
      world.addChild(entity.graphic.mesh);
    }
  }
  app.stage.addChild(world);
  app.stage.addChild(hero.graphic.mesh);

  view.setCameraPosition(hero.graphic.mesh.position);

  app.ticker.add(delta => {
    const now = Date.now();
    const {hero, focus} = state2;

    for (const entity of state2.entities.values()) {
      entity.tick(state2, now, delta);
    }

    if (focus != null) {
      view.focusCamera(focus.box.position);
    }

  });

  const globalInput = new GlobalInput();
  globalInput.setController(
    new ExplorationController(game),
    adaptBrowserController,
  );

  game.globalInput = globalInput;

  game.ui = initUi(game);
}

main();
