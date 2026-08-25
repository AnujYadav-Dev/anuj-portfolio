'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { PageDto } from '@portfolio/shared';

export interface DynamicPageRendererProps {
  page: PageDto;
}

export function DynamicPageRenderer({ page }: DynamicPageRendererProps) {
  return (
    <div className="flex flex-col">
      <PageHeader
        badge={`DYNAMIC // ${page.slug.toUpperCase()}`}
        title={page.title}
        description={page.seoDescription || undefined}
      />

      <div className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <RevealOnScroll>
            <div className="max-w-3xl text-sm leading-relaxed text-foreground/90">
              <MarkdownRenderer content={page.content || ''} />
            </div>
          </RevealOnScroll>

          {/* Attached Content Blocks */}
          {page.contentBlocks && page.contentBlocks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border flex flex-col gap-8 max-w-3xl">
              {page.contentBlocks.map((block) => (
                <div key={block.id} className="flex flex-col gap-2">
                  <h3 className="text-md font-bold text-foreground">{block.title}</h3>
                  <MarkdownRenderer content={block.content || ''} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
