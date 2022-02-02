import * as PIXI from 'pixi.js';
import State from './state2.ts';
import {UI} from './ui.ts';
import {Entity} from './entity.ts';
import {DynamicPhysics, StaticPhysics, OverlayPhysics} from './physics.ts';
import {AnimatedGraphic, StaticGraphic} from './graphic.ts';
import {
  ExplorationController,
  PlacementController,
  GlobalInput,
  adaptBrowserController,
} from './controls.ts';
import View from './view.ts';
import EpitaphDialog from './ui/EpitaphDialog.tsx';

let _game: Game;

export function setGame(game: Game) {
  _game = game;
}

export function getGame(): Game {
  return _game;
}

export class Game {
  pixi: PIXI.Application;
  world: PIXI.Container;
  state: State;
  view: View;
  globalInput: GlobalInput;
  ui: UI;

  setMode(mode: 'play' | 'edit') {
    const {state} = this;
    state.mode = mode;
    if (mode === 'edit') {
      // hide hero
      state.hero.species = state.createSpecies({
        collides: false,
        triggers: false,
      });
      this.pixi.stage.removeChild(state.hero.graphic.mesh);

      // show future plot
      state.futurePlot = new Entity(
        'futurePlot',
        new OverlayPhysics(
          // TODO (kyle): position at center of screen
          {x: 0, y: 0},
          {x: 128, y: 128},
        ),
        // TODO (kyle): using headstone graphic here
        StaticGraphic.fromJSON(state.assets.get('1')),
        // TODO (kyle): don't use grass for this?
        state.species.get('2'),
      );
      state.focus = state.futurePlot;
      state.futurePlot.graphic.mesh.alpha = 0.5;
      state.entities.set(state.futurePlot.id, state.futurePlot);

      this.world.addChild(state.futurePlot.graphic.mesh);

      // set up new controller
      this.globalInput.setController(
        new PlacementController(this, () => {
          this.ui.setDialog(EpitaphDialog, {
            onPost: (text: string) => {
              const newPlot = state.placePlot(text);
              if (newPlot) {
                this.world.addChild(newPlot.graphic.mesh);
                this.world.addChild(state.futurePlot.graphic.mesh);
                this.setMode('play');
              }
            },
          });
        }),
        adaptBrowserController,
      );
    } else {
      this.globalInput.setController(
        new ExplorationController(this, null),
        adaptBrowserController,
      );
      this.world.removeChild(state.futurePlot.graphic.mesh);
      state.entities.delete(state.futurePlot.id);
      state.futurePlot = null;
      state.focus = state.hero;
      state.hero.species = state.species.get('3');
      state.hero.box.adjustForCollisions(state);
      this.pixi.stage.addChild(state.hero.graphic.mesh);
      // TODO (kyle): maybe move camera to hero?
    }

    this.ui.render();
  }
}
