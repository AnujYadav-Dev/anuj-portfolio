'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useAboutSections } from '@/hooks/useProfile';

export default function SingleAboutSectionPage() {
  const params = useParams();
  const sectionSlug = String(params?.section || '');

  const { data: aboutData, isLoading } = useAboutSections();
  const sections = aboutData?.data || [];
  const currentSection = sections.find((s) => s.slug === sectionSlug);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="text-xl font-bold text-foreground">Section Not Found</h2>
        <p className="text-xs text-muted mt-2">
          The requested section could not be located.
        </p>
        <Link href="/about" className="text-xs font-mono text-accent hover:underline mt-4 inline-block">
          ← Back to About Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        badge={`ABOUT // ${currentSection.slug.toUpperCase()}`}
        title={currentSection.title}
      />

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
              <MarkdownRenderer content={currentSection.content || ''} />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
