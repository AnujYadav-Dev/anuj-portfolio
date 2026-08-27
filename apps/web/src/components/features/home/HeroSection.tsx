'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, Mail } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useSiteSettings } from '@/hooks/useLayout';
import { useActiveResume } from '@/hooks/useProfile';
import type { DynamicSectionProps } from './types';
import type { HeroCtaButtonConfig } from '@portfolio/shared';

export function HeroSection({ section }: DynamicSectionProps) {
  const { data: settingsData } = useSiteSettings();
  const { data: resumeData } = useActiveResume();

  const authorName =
    settingsData?.data?.['author_name'] ||
    settingsData?.data?.['author.name'] ||
    settingsData?.data?.['site_title'] ||
    'ANUJ YADAV';

  // Dynamic slogan / intro statement priority: section config > section title > site settings > default fallback
  const heroSlogan =
    (section?.config?.content as string) ||
    section?.title ||
    settingsData?.data?.['site_description'] ||
    settingsData?.data?.['author_job_title'] ||
    settingsData?.data?.['author.tagline'] ||
    'Precision in detail, vision in design, building things one block at a time.';

  const resumeFileUrl = resumeData?.data?.fileUrl;

  // 3 Action Buttons configuration (Admin configured or sensible defaults)
  const cta1: HeroCtaButtonConfig = (section?.config?.heroCta1 as HeroCtaButtonConfig) || {
    label: 'View Works',
    url: '/works',
    target: '_self',
  };

  const cta2: HeroCtaButtonConfig = (section?.config?.heroCta2 as HeroCtaButtonConfig) || {
    label: resumeFileUrl ? 'Download Resume' : 'Resume',
    url: resumeFileUrl || '/resume',
    target: resumeFileUrl ? '_blank' : '_self',
  };

  const cta3: HeroCtaButtonConfig = (section?.config?.heroCta3 as HeroCtaButtonConfig) || {
    label: 'Get in Touch',
    url: '/contact',
    target: '_self',
  };

  return (
    <section
      id="hero"
      className="sticky top-14 z-0 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-background border-b border-border overflow-hidden px-4 md:px-8 py-6 md:py-10"
    >
      <div className="max-w-[1200px] w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Main Content Row: Left Slogan + Right Minimal Action Links */}
        <RevealOnScroll>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 md:gap-12">
            {/* Dynamic Intro Slogan on the Left (Refined ~2 lines typography scale) */}
            <div className="max-w-xl">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug md:leading-normal">
                {heroSlogan}
              </h1>
            </div>

            {/* Minimal Text + Icon Action Links on the Right */}
            <nav
              aria-label="Hero Quick Links"
              className="flex flex-col items-start sm:items-end gap-2.5 shrink-0 font-mono text-xs font-medium"
            >
              {/* Link 1: Works */}
              <Link
                href={cta1.url}
                target={cta1.target === '_blank' ? '_blank' : undefined}
                rel={cta1.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="group inline-flex items-center gap-1.5 text-muted hover:text-accent transition-colors select-none"
              >
                <span className="group-hover:underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent">
                  {cta1.label}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              {/* Link 2: Resume */}
              {cta2.url.startsWith('http') || cta2.target === '_blank' ? (
                <a
                  href={cta2.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-muted hover:text-accent transition-colors select-none"
                >
                  <span className="group-hover:underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent">
                    {cta2.label}
                  </span>
                  {cta2.label.toLowerCase().includes('download') ? (
                    <Download className="h-3.5 w-3.5 text-muted group-hover:text-accent group-hover:translate-y-0.5 transition-all" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  )}
                </a>
              ) : (
                <Link
                  href={cta2.url}
                  className="group inline-flex items-center gap-1.5 text-muted hover:text-accent transition-colors select-none"
                >
                  <span className="group-hover:underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent">
                    {cta2.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              )}

              {/* Link 3: Contact */}
              <Link
                href={cta3.url}
                target={cta3.target === '_blank' ? '_blank' : undefined}
                rel={cta3.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="group inline-flex items-center gap-1.5 text-muted hover:text-accent transition-colors select-none"
              >
                <span className="group-hover:underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent">
                  {cta3.label}
                </span>
                <Mail className="h-3.5 w-3.5 text-muted group-hover:text-accent transition-colors" />
              </Link>
            </nav>
          </div>
        </RevealOnScroll>

        {/* Hero Bottom Display Watermark (Centered & Spans 100% full container width) */}
        <RevealOnScroll delayIndex={2} className="pt-8 md:pt-12 pb-1 select-none overflow-visible w-full flex items-center justify-center">
          <svg
            viewBox="0 0 1000 110"
            className="w-full h-auto select-none overflow-visible block"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="500"
              y="55"
              dominantBaseline="central"
              textAnchor="middle"
              textLength="1000"
              lengthAdjust="spacing"
              className="font-black uppercase fill-current tracking-tight font-sans"
              style={{
                fontSize: '96px',
                fontWeight: 900,
                fontFamily: 'var(--font-geist-sans), sans-serif',
              }}
            >
              {authorName}
            </text>
          </svg>
          <span className="sr-only">{authorName}</span>
        </RevealOnScroll>
      </div>
    </section>
  );
}
