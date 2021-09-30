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

import UiApp from './ui/app';

async function main(): Promise<void> {
  await loadShaders();

  const state2 = ((window as any).state = await State.fromJSON(stateJson));

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
  globalInput.setController(new ExplorationController(state2, null), adaptBrowserController);

  const uiApp = document.createElement('div');
  const renderUi = () => {
    render(
      React.createElement(UiApp, {
        mode: state2.mode,
        onModeChange: mode => {
          console.log('mode change', mode);
          if (mode === 'edit') {
            state2.setMode(mode);
            globalInput.setController(new PlacementController(state2, () => {
              const newPlot = state2.placePlot();
              if (newPlot) {
                world.addChild(newPlot.graphic.mesh);
                world.addChild(state2.futurePlot.graphic.mesh);
              }
            }), adaptBrowserController);
            world.addChild(state2.futurePlot.graphic.mesh);
          } else {
            globalInput.setController(new ExplorationController(state2, null), adaptBrowserController);
            world.removeChild(state2.futurePlot.graphic.mesh);
            state2.setMode(mode);
          }
          renderUi();
        },
      }),
      uiApp,
    );
  };
  renderUi();
  document.body.appendChild(uiApp);
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
