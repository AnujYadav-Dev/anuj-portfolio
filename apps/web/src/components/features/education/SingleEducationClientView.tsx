'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Calendar, MapPin, Award } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SplitSection } from '@/components/common/SplitSection';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { useSingleEducation } from '@/hooks/useProfile';
import type { EducationDto } from '@portfolio/shared';

interface SingleEducationClientViewProps {
  id: string;
  initialData?: EducationDto | null;
}

export function SingleEducationClientView({ id, initialData }: SingleEducationClientViewProps) {
  const { data: eduData, isLoading } = useSingleEducation(id);
  const edu = eduData?.data || initialData;

  if (isLoading && !edu) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 text-center text-sm text-muted font-mono">
        Loading education details...
      </div>
    );
  }

  if (!edu) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground">Education Profile Not Found</h2>
        <p className="text-xs text-muted mt-2">The requested academic qualification does not exist.</p>
        <Link
          href="/education"
          className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold mt-4 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Education</span>
        </Link>
      </div>
    );
  }

  const startDate = edu.startDate
    ? new Date(edu.startDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    : '';
  const endDate = edu.isCurrent
    ? 'Present'
    : edu.endDate
      ? new Date(edu.endDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      : '';

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="ACADEMIC PROFILE"
        title={edu.degree}
        description={`${edu.institution} (${startDate} — ${endDate})`}
      >
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/education"
            className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Education</span>
          </Link>
        </div>
      </PageHeader>

      <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        <SplitSection
          labelNumber="01 // CREDENTIAL"
          labelTitle="Academic Qualification"
          labelSubtitle={edu.institution}
          id="overview"
        >
          <RevealOnScroll>
            <div className="flex flex-col gap-6 bg-surface border border-border rounded-lg p-6 md:p-8 max-w-3xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">{edu.degree}</span>
                    {edu.isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-success/10 text-success border border-success/30 rounded-xs font-semibold">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  {edu.fieldOfStudy && (
                    <span className="text-sm text-muted">Field of Study: {edu.fieldOfStudy}</span>
                  )}
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-accent pt-0.5">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span>{edu.institution}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {startDate} — {endDate}
                  </span>
                  {edu.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {edu.location}
                    </span>
                  )}
                  {edu.grade && (
                    <span className="flex items-center gap-1 text-accent font-semibold">
                      <Award className="h-3.5 w-3.5" />
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
              </div>

              {edu.description && (
                <div className="text-sm text-foreground/90 leading-relaxed">
                  <MarkdownRenderer content={edu.description} />
                </div>
              )}

              {edu.activities && (
                <div className="flex flex-col gap-1.5 pt-4 border-t border-border/40 text-xs">
                  <span className="font-mono font-semibold uppercase tracking-wider text-muted">
                    Activities & Societies
                  </span>
                  <p className="text-muted leading-relaxed">{edu.activities}</p>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </SplitSection>
      </div>
    </div>
  );
}
