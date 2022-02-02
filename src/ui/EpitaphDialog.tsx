import * as React from 'react';
import {css} from '@emotion/css';
import {Button} from './button.tsx';

export default function EpitaphDialog({
  onClose,
  onPost,
}: {
  onClose: () => unknown;
  onPost: (text: string) => unknown;
}): React.ReactNode {
  const [text, setText] = React.useState('');

  const handlePost = () => {
    if (!text) {
      return;
    }
    onClose();
    onPost(text);
  };

  return (
    <form
      onSubmit={handlePost}
      className={css`
        background: white;
        width: 400px;
        padding: 10px;
      `}
    >
      <div>Enter your epitaph.</div>
      <textarea
        name="text"
        onChange={event => setText(event.currentTarget.value)}
        value={text}
      />
      <div>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!text} onClick={handlePost}>
          Post
        </Button>
      </div>
    </form>
  );
}
