import * as React from 'react';
import {render} from 'react-dom';
import {
  ExplorationController,
  PlacementController,
  GlobalInput,
  adaptBrowserController,
} from './controls';

import UiApp from './ui/app';
import EpitaphDialog from './ui/EpitaphDialog';

export interface UI {
  render: () => void;
  setDialog: <P>(dialog: React.FC<DialogProps & P>, props: P) => void;
  closeDialog: () => void;
}

export function init(game): UI {
  const{world, globalInput, state} = game;
  const uiAppElement = document.createElement('div');
  let uiApp;
  const renderUi = () => {
    uiApp = render(
      React.createElement(UiApp, {
        game,
        mode: state.mode,
        onModeChange: mode => {
          if (mode === 'edit') {
            state.setMode(mode);
            globalInput.setController(
              new PlacementController(state, () => {
                setDialog(EpitaphDialog, {
                  onPost: (text: string) => {
                    const newPlot = state.placePlot(text);
                    if (newPlot) {
                      world.addChild(newPlot.graphic.mesh);
                      world.addChild(state.futurePlot.graphic.mesh);
                    }
                  },
                });
              }),
              adaptBrowserController,
            );
            world.addChild(state.futurePlot.graphic.mesh);
          } else {
            globalInput.setController(
              new ExplorationController(state, null),
              adaptBrowserController,
            );
            world.removeChild(state.futurePlot.graphic.mesh);
            state.setMode(mode);
          }
          renderUi();
        },
      }),
      uiAppElement,
    );
  };
  renderUi();

  const setDialog = (dialog, props) => {
    globalInput.pauseAdapter();
    state.dialog = React.createElement(dialog, {
      ...props,
      onClose: closeDialog,
    });
    renderUi();
  };

  const closeDialog = () => {
    globalInput.startAdapter();
    state.dialog = null;
    renderUi();
  };

  document.body.appendChild(uiAppElement);

  return {
    render: renderUi,
    setDialog,
    closeDialog,
  };
}

interface DialogProps {
  onClose: () => void;
}
