import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: mockSetTheme,
  }),
}));

describe('ThemeToggle (Component & Accessibility)', () => {
  it('renders accessible theme switcher button with aria-label', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
