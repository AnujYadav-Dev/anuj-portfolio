import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { ContentBlocksRenderer } from '@/components/features/blocks/ContentBlocksRenderer';
import { formatSectionTag, type DynamicSectionProps } from './types';

export function CustomMarkdownSection({ section, index }: DynamicSectionProps) {
  const sectionTitle = section?.title || 'Section Note';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Custom Content & Documentation';

  const defaultTag = section?.sectionKey?.replace(/_/g, ' ').toUpperCase() || 'NOTE';
  const labelNumber = formatSectionTag({
    index,
    showSectionNumber: section?.config?.showSectionNumber !== false,
    labelTag: (section?.config?.labelTag as string) || defaultTag,
    tagSeparator: (section?.config?.tagSeparator as string) ?? '//',
    customLabelNumber: section?.config?.labelNumber as string,
  });

  const markdownContent =
    (section?.config?.content as string) ||
    '# Custom Section\n\nConfigure this section content from the Admin Dashboard.';

  const ctaLabel = section?.config?.ctaLabel as string | undefined;
  const ctaUrl = section?.config?.ctaUrl as string | undefined;
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id={section?.sectionKey || 'custom-section'}
    >
      <RevealOnScroll>
        <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed max-w-2xl">
          <div className="text-sm leading-relaxed text-foreground/90">
            <MarkdownRenderer content={markdownContent} />
          </div>

          {section?.contentBlocks && section.contentBlocks.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <ContentBlocksRenderer blocks={section.contentBlocks} />
            </div>
          )}

          {ctaLabel && ctaUrl && (
            <div className="pt-2">
              <Link
                href={ctaUrl}
                target={ctaTarget === '_blank' ? '_blank' : undefined}
                rel={ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 transition-colors"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </RevealOnScroll>
    </SplitSection>
  );
}
