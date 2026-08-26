import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from '@/components/layout/MobileNav';

vi.mock('@/hooks/useLayout', () => ({
  useNavItems: () => ({
    data: {
      data: [
        { id: '1', label: 'Works', url: '/works' },
        { id: '2', label: 'Blogs', url: '/blogs' },
      ],
    },
  }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useSocialLinks: () => ({ data: { data: [] } }),
  useActiveResume: () => ({ data: { data: null } }),
}));

describe('MobileNav (Component & Accessibility)', () => {
  it('renders mobile dialog with role=dialog and aria-modal=true when open', () => {
    render(<MobileNav isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: /Mobile Navigation Menu/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('id', 'mobile-nav-drawer');
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();
    render(<MobileNav isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<MobileNav isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText('Close menu');
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
