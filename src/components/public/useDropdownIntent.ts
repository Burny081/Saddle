import { useEffect, useRef, useState } from 'react';

type DropdownTrigger = 'hover' | 'click';

/** Keeps a mega-menu open while the pointer travels between its trigger and panel. */
export function useDropdownIntent(trigger: DropdownTrigger) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isOpen) return;

    const dismissOutside = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) close();
    };

    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [isOpen]);

  return { isOpen, setIsOpen, wrapperRef, open, scheduleClose, cancelClose, close };
}
