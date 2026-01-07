import { get, writable } from 'svelte/store';

interface DraggableOptions {
  storageKey: string;
  initialPosition?: { x: number; y: number };
}

export function draggable(node: HTMLElement, options: DraggableOptions) {
  let moving = false;
  let x: number;
  let y: number;

  // Load position from localStorage or use initial
  const storedPosition = localStorage.getItem(options.storageKey);
  if (storedPosition) {
    const pos = JSON.parse(storedPosition);
    x = pos.x;
    y = pos.y;
  } else if (options.initialPosition) {
    x = options.initialPosition.x;
    y = options.initialPosition.y;
  } else {
    // Default to top-left if no position is provided
    x = 0;
    y = 0;
  }

  node.style.position = 'absolute';
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.cursor = 'move';
  node.style.userSelect = 'none';

  const onMouseDown = (e: MouseEvent) => {
    moving = true;
    e.preventDefault();
  };

  const onMouseUp = () => {
    moving = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (moving) {
      x += e.movementX;
      y += e.movementY;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      localStorage.setItem(options.storageKey, JSON.stringify({ x, y }));
    }
  };

  node.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);

  return {
    destroy() {
      node.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    }
  };
}