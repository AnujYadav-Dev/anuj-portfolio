'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { useAboutSections } from '@/hooks/useProfile';
import { formatSectionTag, type DynamicSectionProps } from './types';

export function AboutPreview({ section, index }: DynamicSectionProps) {
  const { data: aboutData } = useAboutSections();

  const firstSection = aboutData?.data?.[0];
  const sectionTitle = section?.title || firstSection?.title || 'Who am I?';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Background & Philosophy';

  const labelNumber = formatSectionTag({
    index,
    showSectionNumber: section?.config?.showSectionNumber !== false,
    labelTag: (section?.config?.labelTag as string) || 'INTRO',
    tagSeparator: (section?.config?.tagSeparator as string) ?? '//',
    customLabelNumber: section?.config?.labelNumber as string,
  });

  const ctaLabel =
    (section?.config?.ctaLabel as string) || 'Read Full Journey & Philosophy';
  const ctaUrl = (section?.config?.ctaUrl as string) || '/about';
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';

  const sectionContent =
    (section?.config?.content as string) ||
    firstSection?.content ||
    'I am a full-stack engineer and distributed systems enthusiast dedicated to engineering high-performance web applications, accessible design systems, and robust backend microservices. I bridge the gap between architectural rigor and refined frontend craft.';

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id="about"
    >
      <RevealOnScroll>
        <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed max-w-2xl">
          {/* Pure Dynamic Markdown Narrative */}
          <div className="text-sm leading-relaxed text-foreground/90">
            <MarkdownRenderer content={sectionContent} />
          </div>

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
        </div>
      </RevealOnScroll>
    </SplitSection>
  );
}
