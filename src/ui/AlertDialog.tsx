import * as React from 'react';
import {css} from '@emotion/css';

export default function EpitaphDialog({
  onClose,
  text,
}: {
  onClose: () => unknown;
  text: string;
}): React.ReactNode {
  return (
    <div
      className={css`
        background: white;
        width: 400px;
        padding: 10px;
      `}
    >
      {text}
    </div>
  );
}
