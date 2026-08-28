'use client';

import * as React from 'react';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { cn } from '@/lib/cn';

export interface FooterNameBannerProps {
  name?: string;
  className?: string;
}

export function FooterNameBanner({ name = 'ANUJ YADAV', className }: FooterNameBannerProps) {
  return (
    <RevealOnScroll
      className={cn('w-full select-none border-b border-border/70 pb-8 md:pb-12', className)}
    >
      <div className="w-full flex items-center justify-center text-center overflow-visible">
        <svg
          viewBox="0 0 1000 110"
          className="w-full h-auto select-none overflow-visible block text-foreground/20 hover:text-foreground transition-colors duration-300 cursor-default"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            x="500"
            y="55"
            dominantBaseline="central"
            textAnchor="middle"
            textLength="1000"
            lengthAdjust="spacing"
            className="font-black uppercase fill-current tracking-tight font-sans"
            style={{
              fontSize: '96px',
              fontWeight: 900,
              fontFamily: 'var(--font-geist-sans), sans-serif',
            }}
          >
            {name}
          </text>
        </svg>
        <span className="sr-only">{name}</span>
      </div>
    </RevealOnScroll>
  );
}
