'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Calendar, MapPin, Award } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SplitSection } from '@/components/common/SplitSection';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { useEducation } from '@/hooks/useProfile';
import type { EducationDto } from '@portfolio/shared';

interface EducationClientViewProps {
  initialData?: EducationDto[];
}

export function EducationClientView({ initialData }: EducationClientViewProps) {
  const { data: eduData, isLoading } = useEducation();
  const rawEducationList = eduData?.data || initialData;

  // Sort education: strictly honor the admin's drag-and-drop sortOrder
  const sortedEducation = React.useMemo(() => {
    const list = rawEducationList || [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawEducationList]);

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="ACADEMIC BACKGROUND"
        title="Education & Academic Qualifications"
        description="Formal academic degrees, computer science curriculum foundations, coursework, and technical achievements."
      >
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono">
          <Link
            href="/experience"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Career Experience</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/certificates-achievements"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Certificates & Awards</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/skills"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Skills Matrix</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </PageHeader>

      {/* Main Education Content */}
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        {isLoading && sortedEducation.length === 0 ? (
          <div className="flex flex-col gap-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : sortedEducation.length > 0 ? (
          sortedEducation.map((edu, idx) => {
            const startDate = edu.startDate
              ? new Date(edu.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '';
            const endDate = edu.isCurrent
              ? 'Present'
              : edu.endDate
                ? new Date(edu.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

            const sectionNum = String(idx + 1).padStart(2, '0');

            return (
              <SplitSection
                key={edu.id}
                labelNumber={`${sectionNum} // DEGREE`}
                labelTitle={edu.degree}
                labelSubtitle={edu.institution}
                id={`edu-${edu.id}`}
              >
                <RevealOnScroll>
                  <div className="flex flex-col gap-4 bg-surface border border-border rounded-lg p-6 md:p-8">
                    {/* Header: Degree + Institution + Dates */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-foreground">{edu.degree}</h3>
                          {edu.fieldOfStudy && (
                            <span className="text-muted text-xs">in {edu.fieldOfStudy}</span>
                          )}
                          {edu.isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-success/10 text-success border border-success/30 rounded-xs font-semibold">
                              IN PROGRESS
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                          <GraduationCap className="h-4 w-4 shrink-0" />
                          <span>{edu.institution}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted pt-1">
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
                    </div>

                    {/* Description */}
                    {edu.description && (
                      <div className="text-sm text-foreground/90 leading-relaxed">
                        <MarkdownRenderer content={edu.description} />
                      </div>
                    )}

                    {/* Activities & Coursework */}
                    {edu.activities && (
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40 text-xs">
                        <span className="font-mono font-semibold uppercase tracking-wider text-muted">
                          Activities & Societies
                        </span>
                        <p className="text-muted leading-relaxed">{edu.activities}</p>
                      </div>
                    )}

                    {/* Single View Deep Dive Link */}
                    <div className="pt-2">
                      <Link
                        href={`/education/${edu.id}`}
                        className="text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View Academic Profile & Summary</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </RevealOnScroll>
              </SplitSection>
            );
          })
        ) : (
          <div className="py-16 text-center text-sm text-muted font-mono bg-surface border border-border rounded-lg">
            No education entries available yet.
          </div>
        )}
      </div>
    </div>
  );
}
