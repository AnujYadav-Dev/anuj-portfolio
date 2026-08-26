import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button (Component & Accessibility)', () => {
  it('renders children and responds to click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click Me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants and sizes properly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    let btn = screen.getByRole('button', { name: /delete/i });
    expect(btn.className).toContain('bg-destructive');

    rerender(
      <Button variant="outline" size="sm">
        Small Outline
      </Button>,
    );
    btn = screen.getByRole('button', { name: /small outline/i });
    expect(btn.className).toContain('border-border');
    expect(btn.className).toContain('h-8');
  });

  it('handles loading state with aria-busy and disabled', () => {
    render(<Button isLoading>Saving</Button>);

    const btn = screen.getByRole('button', { name: /saving/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const btn = screen.getByRole('button', { name: /disabled button/i });
    expect(btn).toBeDisabled();
  });
});
