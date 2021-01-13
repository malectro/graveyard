import * as React from 'react';

export default function UiApp(): React.ReactNode {
  return (
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
        style={{
          height: 30,
        }}
      >
        Edit
      </Button>
    </div>
  );
}

function Button({onClick, style, children}) {
  return (
    <div role="button" tabIndex="0" onClick={onClick} style={{
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      ...style
    }}>
      {children}
    </div>
  );
}
