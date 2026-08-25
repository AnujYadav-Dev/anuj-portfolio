'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useAboutSections } from '@/hooks/useProfile';

export function AboutPreview() {
  const { data: aboutData } = useAboutSections();

  const firstSection = aboutData?.data?.[0];
  const sectionTitle = firstSection?.title || 'Who am I?';
  const sectionContent =
    firstSection?.content ||
    'I am a full-stack engineer and distributed systems enthusiast dedicated to engineering high-performance web applications, accessible design systems, and robust backend microservices. I bridge the gap between architectural rigor and refined frontend craft.';

  return (
    <SplitSection
      labelNumber="01 // INTRO"
      labelTitle={sectionTitle}
      labelSubtitle="Background & Philosophy"
    >
      <RevealOnScroll>
        <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed max-w-2xl">
          <p className="text-foreground font-medium text-md leading-snug">
            Passionate about transforming complex domain challenges into{' '}
            <span className="text-accent underline decoration-accent/40 underline-offset-4">
              clean architectural abstractions
            </span>{' '}
            and pixel-perfect user interfaces.
          </p>

          <p>{sectionContent}</p>

          <div className="pt-2">
            <Link
              href="/about"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 transition-colors"
            >
              <span>Read Full Journey & Philosophy</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </SplitSection>
  );
}
