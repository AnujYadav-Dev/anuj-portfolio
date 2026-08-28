'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Calendar, MapPin, Globe } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { useExperience } from '@/hooks/useProfile';
import type { ExperienceDto } from '@portfolio/shared';

interface SingleExperienceClientViewProps {
  id: string;
  initialData?: ExperienceDto | null;
}

export function SingleExperienceClientView({ id, initialData }: SingleExperienceClientViewProps) {
  const { data: expData, isLoading } = useExperience(id);
  const exp = expData?.data || initialData;

  if (isLoading && !exp) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 text-center text-sm text-muted font-mono">
        Loading experience details...
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground">Experience Not Found</h2>
        <p className="text-xs text-muted mt-2">The requested experience profile does not exist.</p>
        <Link
          href="/experience"
          className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold mt-4 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Experience</span>
        </Link>
      </div>
    );
  }

  const startDate = exp.startDate
    ? new Date(exp.startDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    : '';
  const endDate = exp.isCurrent
    ? 'Present'
    : exp.endDate
      ? new Date(exp.endDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      : '';

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="ROLE DEEP-DIVE"
        title={exp.role}
        description={`Professional tenure at ${exp.companyName} (${startDate} — ${endDate})`}
      >
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/experience"
            className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Experience</span>
          </Link>
        </div>
      </PageHeader>

      <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        <SplitSection
          labelNumber="01 // OVERVIEW"
          labelTitle="Role Overview"
          labelSubtitle={exp.companyName}
          id="overview"
        >
          <RevealOnScroll>
            <div className="flex flex-col gap-6 bg-surface border border-border rounded-lg p-6 md:p-8 max-w-3xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">{exp.role}</span>
                    {exp.isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-success/10 text-success border border-success/30 rounded-xs font-semibold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-accent">{exp.companyName}</span>
                </div>

                <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {startDate} — {endDate}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {exp.location}
                    </span>
                  )}
                </div>
              </div>

              {exp.description && (
                <div className="text-sm text-foreground/90 leading-relaxed">
                  <MarkdownRenderer content={exp.description} />
                </div>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">
                    Technologies & Architecture Stack
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((t) => (
                      <Badge key={t} variant="outline" size="md">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {exp.companyUrl && (
                <div className="pt-2">
                  <a
                    href={exp.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Visit {exp.companyName} Website</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </SplitSection>
      </div>
    </div>
  );
}
