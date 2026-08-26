'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { AboutSectionDto } from '@portfolio/shared';

interface AboutSectionClientProps {
  section: AboutSectionDto;
}

export function AboutSectionClient({ section }: AboutSectionClientProps) {
  return (
    <div className="flex flex-col">
      <PageHeader badge={`ABOUT // ${section.slug.toUpperCase()}`} title={section.title} />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="mb-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors select-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to About overview</span>
            </Link>
          </div>

          <RevealOnScroll>
            <div className="max-w-3xl text-sm leading-relaxed text-foreground/90">
              <MarkdownRenderer content={section.content || ''} />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
