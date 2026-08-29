'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ContentBlockDto } from '@portfolio/shared';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { ZoomableImage } from '@/components/content/ZoomableImage';
import { Button } from '@/components/ui/button';

export interface ContentBlocksRendererProps {
  blocks?: ContentBlockDto[] | null;
  className?: string;
}

export function ContentBlocksRenderer({ blocks, className = '' }: ContentBlocksRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const enabledBlocks = blocks.filter((b) => b.isEnabled !== false);
  if (enabledBlocks.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-8 w-full ${className}`}>
      {enabledBlocks.map((block) => (
        <div key={block.id} className="flex flex-col gap-3">
          {block.title && (
            <h3 className="text-base font-bold tracking-tight text-foreground font-mono">
              {block.title}
            </h3>
          )}

          {/* Block Type: Image */}
          {block.blockType === 'image' && block.mediaUrl && (
            <div className="rounded-lg overflow-hidden border border-border bg-surface p-2 shadow-sm">
              <ZoomableImage
                src={block.mediaUrl}
                alt={block.title || 'Attached Content Visual'}
                caption={block.content || undefined}
              />
            </div>
          )}

          {/* Block Type: CTA */}
          {block.blockType === 'cta' && (
            <div className="p-5 rounded-lg border border-border bg-surface/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-col gap-1 text-sm text-foreground">
                {block.content && <MarkdownRenderer content={block.content} />}
              </div>
              {typeof (block.config as Record<string, unknown>)?.ctaUrl === 'string' && (
                <Link
                  href={String((block.config as Record<string, unknown>).ctaUrl)}
                  target={
                    (block.config as Record<string, unknown>).isExternal ? '_blank' : undefined
                  }
                  rel={
                    (block.config as Record<string, unknown>).isExternal
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  <Button variant="primary" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    {String((block.config as Record<string, unknown>).ctaLabel || 'Explore More')}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Block Type: Markdown / Text / Custom */}
          {block.blockType !== 'image' && block.blockType !== 'cta' && block.content && (
            <div className="text-sm leading-relaxed text-foreground/90">
              <MarkdownRenderer content={block.content} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
