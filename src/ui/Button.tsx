import * as React from 'react';

export function Button({onClick, style, children, disabled}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={!disabled ? onClick : null}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
