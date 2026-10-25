import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDropdownIntent } from './useDropdownIntent';

function DropdownHarness() {
  const { isOpen, wrapperRef, open } = useDropdownIntent('hover');
  return (
    <>
      <div ref={wrapperRef} onPointerEnter={open}>
        <button>Produits</button>
        {isOpen && <div role="menu">Menu produits</div>}
      </div>
      <button>Autre action</button>
    </>
  );
}

describe('useDropdownIntent', () => {
  it('closes an open menu when a pointer event occurs outside its wrapper', () => {
    render(<DropdownHarness />);

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Produits' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Autre action' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
