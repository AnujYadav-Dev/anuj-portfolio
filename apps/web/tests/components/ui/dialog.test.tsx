import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

describe('Dialog (Component & Accessibility)', () => {
  it('renders modal content with role=dialog and aria-modal=true when open', () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>Overview of architecture</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Project Details')).toBeInTheDocument();
  });

  it('triggers onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose}>
        <DialogContent>
          <DialogTitle>Modal</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Dialog isOpen={true} onClose={handleClose}>
        <DialogContent showClose={true}>
          <DialogTitle>Modal</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const closeBtn = screen.getByLabelText('Close dialog');
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders with custom size classes and supports expand toggle', async () => {
    const user = userEvent.setup();

    render(
      <Dialog isOpen={true} onClose={vi.fn()}>
        <DialogContent size="3xl" expandable={true}>
          <DialogTitle>Large Editor Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const expandBtn = screen.getByLabelText('Maximize dialog width');
    expect(expandBtn).toBeInTheDocument();

    await user.click(expandBtn);
    expect(screen.getByLabelText('Restore dialog width')).toBeInTheDocument();
  });

  it('renders resize grips when resizable is enabled', () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()}>
        <DialogContent resizable={true}>
          <DialogTitle>Resizable Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const grips = screen.getAllByRole('separator');
    expect(grips.length).toBeGreaterThanOrEqual(2);
  });
});
