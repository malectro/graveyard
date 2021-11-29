import * as React from 'react';
import {Button} from './button';
import {css} from '@emotion/css';
import styled from '@emotion/styled';

export default function UiApp({state, mode, onModeChange}): React.ReactNode {
  const {dialog} = state;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          flexFlow: 'column',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
        }}
      >
        <Button
          onClick={() => {
            onModeChange(mode === 'edit' ? 'play' : 'edit');
          }}
          style={{
            height: 30,
          }}
        >
          {mode === 'edit' ? 'Play' : 'Edit'}
        </Button>
      </div>

      {dialog && <DialogField>{dialog}</DialogField>}
    </div>
  );
}

function DialogField({children}) {
  return (
    <div
      className={css`
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
      `}
    >
      <div
        className={css`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        `}
      />
      <div
        className={css`
          z-index: 1;
        `}
      >
        {children}
      </div>
    </div>
  );
}
