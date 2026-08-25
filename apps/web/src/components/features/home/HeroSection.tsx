'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useSiteSettings } from '@/hooks/useLayout';
import { useActiveResume } from '@/hooks/useProfile';

export function HeroSection() {
  const { data: settingsData } = useSiteSettings();
  const { data: resumeData } = useActiveResume();

  const authorName = settingsData?.data?.['author.name'] || 'ANUJ YADAV';
  const authorTagline =
    settingsData?.data?.['author.tagline'] ||
    'Software Engineer & Systems Architect building resilient, high-craft web experiences and distributed platforms.';
  const isAvailable = settingsData?.data?.['author.available'] !== 'false';

  return (
    <section className="relative overflow-hidden border-b border-border bg-background pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <RevealOnScroll>
          <div className="flex flex-col gap-6 max-w-2xl">
            {/* Availability Indicator Badge */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isAvailable ? 'bg-success' : 'bg-muted'}`}
                />
              </span>
              <span className="text-xs font-mono font-medium tracking-wide text-foreground">
                {isAvailable
                  ? 'AVAILABLE FOR HIGH-IMPACT ROLES'
                  : 'CURRENTLY OCCUPIED'}
              </span>
            </div>

            {/* Tagline Statement */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-snug max-w-xl">
              {authorTagline}
            </h1>

            {/* CTA Action Links with warm orange styling */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium">
              <Link
                href="/works"
                className="group inline-flex items-center gap-1 text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 font-semibold transition-colors"
              >
                <span>View Works</span>
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              {resumeData?.data?.fileUrl ? (
                <a
                  href={resumeData.data.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-muted hover:text-foreground underline decoration-border hover:decoration-muted underline-offset-4 transition-colors"
                >
                  <span>Download Resume</span>
                  <Download className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link
                  href="/resume"
                  className="group inline-flex items-center gap-1 text-muted hover:text-foreground underline decoration-border hover:decoration-muted underline-offset-4 transition-colors"
                >
                  <span>Resume</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}

              <Link
                href="/contact"
                className="group inline-flex items-center gap-1 text-muted hover:text-foreground underline decoration-border hover:decoration-muted underline-offset-4 transition-colors"
              >
                <span>Get in Touch</span>
                <Mail className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        {/* Hero Bottom Giant Name Watermark */}
        <div className="pt-12 md:pt-20 select-none overflow-hidden">
          <p className="font-extrabold tracking-tight text-foreground uppercase font-sans text-[clamp(3.5rem,13vw,8.5rem)] leading-none truncate">
            {authorName}
          </p>
        </div>
      </div>
    </section>
  );
}
