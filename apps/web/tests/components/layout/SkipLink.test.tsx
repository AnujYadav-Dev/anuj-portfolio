import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from '@/components/layout/SkipLink';

describe('SkipLink (Component & Accessibility)', () => {
  it('renders skip link pointing to #main-content', () => {
    render(<SkipLink />);

    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });
});
