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
import {Terrain} from './terrain';
import {chunkKeysForBox} from './chunk-map';
import {fetchChunks, fetchRole} from './api';

async function main(): Promise<void> {
  await loadShaders();

  let game: Game = new Game();
  setGame(game);

  const state2 = await State.fromJSON(stateJson);
  state2.role = await fetchRole();
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

  const terrain = new Terrain(app.screen.width, app.screen.height);
  const world = new PIXI.Container();
  game.world = world;
  game.view = view;
  game.terrain = terrain;

  const {hero} = state2;
  state2.focus = hero;
  app.stage.addChild(terrain.grass);
  app.stage.addChild(terrain.paths);
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

    // Load chunks from server as needed
    const visibleKeys = chunkKeysForBox(viewBox);
    const unloadedKeys = visibleKeys.filter(
      k => !state2.entities.isChunkLoaded(k) && !state2.entities.isChunkPending(k),
    );
    if (unloadedKeys.length > 0) {
      for (const k of unloadedKeys) {
        state2.entities.markChunkPending(k);
      }
      fetchChunks(unloadedKeys).then(chunkData => {
        for (const [key, records] of chunkData) {
          for (const record of records) {
            if (!state2.entities.get(record.id)) {
              const entity = state2.createTombstoneEntity(record);
              state2.entities.set(entity.id, entity);
            }
          }
          state2.entities.markChunkLoaded(key);
        }
      }).catch(err => {
        console.error('Failed to fetch chunks:', err);
        for (const k of unloadedKeys) {
          state2.entities.pendingChunks.delete(k);
        }
      });
    }

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

    terrain.update(view.camera.position.x, view.camera.position.y);
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
