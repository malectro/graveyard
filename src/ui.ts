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
  const {world, globalInput, state} = game;
  const uiAppElement = document.createElement('div');
  let uiApp;
  const renderUi = () => {
    uiApp = render(
      React.createElement(UiApp, {
        game,
        mode: state.mode,
        onModeChange: mode => game.setMode(mode),
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
