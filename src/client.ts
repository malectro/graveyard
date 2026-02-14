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
  app.stage.addChild(world);
  app.stage.addChild(hero.graphic.mesh);

  view.setCameraPosition(hero.graphic.mesh.position);

  app.ticker.add(delta => {
    const now = Date.now();
    const {hero, focus} = state2;

    // Always tick the hero
    hero.tick(state2, now, delta);

    // Determine visible region
    const viewBox = view.getViewBox();

    // Track which entity meshes should be visible
    const visibleIds = new Set<string>();
    visibleIds.add(hero.id);

    for (const entity of state2.entities.entitiesInBox(viewBox)) {
      visibleIds.add(entity.id);

      // Add mesh to world if not already present
      if (!entity.graphic.mesh.parent || entity.graphic.mesh.parent !== world) {
        if (entity !== hero) {
          world.addChild(entity.graphic.mesh);
        }
      }

      // Tick non-hero entities
      if (entity !== hero) {
        entity.tick(state2, now, delta);
      }
    }

    // Remove meshes for entities no longer visible
    for (let i = world.children.length - 1; i >= 0; i--) {
      const child = world.children[i];
      if (child.name && !visibleIds.has(child.name)) {
        world.removeChild(child);
      }
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
