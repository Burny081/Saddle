import { useEffect, useRef, useState } from 'react';

type DropdownTrigger = 'hover' | 'click';

/** Keeps a mega-menu open while the pointer travels between its trigger and panel. */
export function useDropdownIntent(trigger: DropdownTrigger) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = () => {
    cancelClose();
    if (trigger === 'hover') setIsOpen(true);
  };

  const scheduleClose = () => {
    if (trigger !== 'hover') return;
    cancelClose();
    closeTimer.current = setTimeout(() => setIsOpen(false), 140);
  };

  const close = () => {
    cancelClose();
    setIsOpen(false);
  };

  useEffect(() => () => cancelClose(), []);

  return { isOpen, setIsOpen, open, scheduleClose, cancelClose, close };
}
