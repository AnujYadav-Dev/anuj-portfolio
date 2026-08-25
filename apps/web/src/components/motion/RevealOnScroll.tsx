'use client';

import * as React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/cn';

export interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  delayIndex?: 1 | 2 | 3 | 4 | 5;
  threshold?: number;
  triggerOnce?: boolean;
}

export function RevealOnScroll({
  children,
  className,
  delayIndex,
  threshold = 0.1,
  triggerOnce = true,
  ...props
}: RevealOnScrollProps) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>({
    threshold,
    triggerOnce,
  });

  const delayClass = delayIndex ? `reveal-delay-${delayIndex}` : '';

  return (
    <div
      ref={ref}
      className={cn('reveal-on-scroll', isRevealed && 'is-revealed', delayClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}
