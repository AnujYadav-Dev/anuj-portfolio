import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';

describe('RevealOnScroll Component', () => {
  it('renders children and applies base reveal-on-scroll class', () => {
    render(
      <RevealOnScroll data-testid="reveal-box">
        <span>Animated Content</span>
      </RevealOnScroll>,
    );

    const element = screen.getByTestId('reveal-box');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('reveal-on-scroll');
    expect(screen.getByText('Animated Content')).toBeInTheDocument();
  });

  it('applies staggered delay class when delayIndex is provided', () => {
    render(
      <RevealOnScroll delayIndex={3} data-testid="stagger-box">
        <span>Staggered Item</span>
      </RevealOnScroll>,
    );

    const element = screen.getByTestId('stagger-box');
    expect(element).toHaveClass('reveal-on-scroll');
    expect(element).toHaveClass('reveal-delay-3');
  });

  it('applies custom transitionDelay inline style when delayMs is provided', () => {
    render(
      <RevealOnScroll delayMs={250} style={{ margin: '10px' }} data-testid="custom-delay-box">
        <span>Custom Delayed Item</span>
      </RevealOnScroll>,
    );

    const element = screen.getByTestId('custom-delay-box');
    expect(element).toHaveClass('reveal-on-scroll');
    expect(element).toHaveStyle({ transitionDelay: '250ms', margin: '10px' });
  });

  it('merges custom className properly', () => {
    render(
      <RevealOnScroll className="custom-class mt-4" data-testid="custom-class-box">
        <span>Custom Class Item</span>
      </RevealOnScroll>,
    );

    const element = screen.getByTestId('custom-class-box');
    expect(element).toHaveClass('reveal-on-scroll');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('mt-4');
  });
});
