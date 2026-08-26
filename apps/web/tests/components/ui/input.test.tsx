import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input (Component & Accessibility)', () => {
  it('renders input with label connected via htmlFor/id', () => {
    render(<Input label="Email Address" placeholder="you@example.com" />);

    const label = screen.getByText('Email Address');
    const input = screen.getByPlaceholderText('you@example.com');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('renders error message with role=alert and aria-invalid=true', () => {
    render(
      <Input
        label="Password"
        error="Password must be at least 8 characters"
        placeholder="Enter password"
      />,
    );

    const input = screen.getByPlaceholderText('Enter password');
    const errorMsg = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(errorMsg).toHaveTextContent('Password must be at least 8 characters');
    expect(input).toHaveAttribute('aria-describedby', errorMsg.getAttribute('id'));
  });

  it('accepts typing correctly', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
    await user.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });
});
