'use client';

import * as React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/cn';

export interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  delayIndex?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function RevealOnScroll({
  children,
  className,
  delayIndex,
  delayMs,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true,
  style,
  ...props
}: RevealOnScrollProps) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const delayClass = delayIndex ? `reveal-delay-${delayIndex}` : '';
  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(delayMs !== undefined ? { transitionDelay: `${delayMs}ms` } : {}),
  };

  return (
    <div
      ref={ref}
      className={cn('reveal-on-scroll', isRevealed && 'is-revealed', delayClass, className)}
      style={inlineStyle}
      {...props}
    >
      {children}
    </div>
  );
}
