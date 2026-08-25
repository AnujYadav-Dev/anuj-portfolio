'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SplitSection } from '@/components/common/SplitSection';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { useAboutSections } from '@/hooks/useProfile';

export default function AboutPage() {
  const { data: aboutData, isLoading } = useAboutSections();
  const sections = aboutData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="ABOUT & BIOGRAPHY"
        title="Background, Principles & Journey"
        description="A deeper look into my engineering philosophy, architectural background, and technical journey."
      >
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono">
          <Link
            href="/skills"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Skills Matrix</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/my-timeline"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Timeline</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/certificates-achievements"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Certificates & Awards</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </PageHeader>

      {/* Dynamic About Sections */}
      {isLoading ? (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : sections.length > 0 ? (
        sections.map((section, idx) => (
          <SplitSection
            key={section.id}
            labelNumber={`0${idx + 1} // ${section.slug.toUpperCase()}`}
            labelTitle={section.title}
          >
            <RevealOnScroll>
              <div className="max-w-2xl text-sm leading-relaxed text-foreground/90">
                <MarkdownRenderer content={section.content || ''} />
              </div>
            </RevealOnScroll>
          </SplitSection>
        ))
      ) : (
        <SplitSection labelNumber="01 // INTRO" labelTitle="Who am I?">
          <p className="text-sm text-muted">
            Software engineer dedicated to clean architecture, distributed systems, and refined user
            interfaces.
          </p>
        </SplitSection>
      )}
    </div>
  );
}
