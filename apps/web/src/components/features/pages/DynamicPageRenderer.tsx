'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { PageDto } from '@portfolio/shared';
import { ContentBlocksRenderer } from '@/components/features/blocks/ContentBlocksRenderer';

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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {page.content && (
            <RevealOnScroll>
              <div className="max-w-3xl text-sm leading-relaxed text-foreground/90">
                <MarkdownRenderer content={page.content} />
              </div>
            </RevealOnScroll>
          )}

          {/* Attached Modular Content Blocks */}
          {page.contentBlocks && page.contentBlocks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border max-w-3xl">
              <ContentBlocksRenderer blocks={page.contentBlocks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
