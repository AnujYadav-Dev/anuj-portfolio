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
      <div className="w-full flex items-center justify-center text-center">
        <h2 className="w-full text-center text-[clamp(2.5rem,8vw,8rem)] xl:text-[8.5rem] font-black font-mono tracking-tight sm:tracking-tight md:tracking-normal leading-none text-foreground/20 hover:text-foreground transition-colors duration-300 uppercase whitespace-nowrap cursor-default">
          {name}
        </h2>
      </div>
    </RevealOnScroll>
  );
}
