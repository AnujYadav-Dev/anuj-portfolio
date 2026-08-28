'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, Globe } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { useExperiences } from '@/hooks/useProfile';
import type { ExperienceDto } from '@portfolio/shared';

interface ExperienceClientViewProps {
  initialData?: ExperienceDto[];
}

export function ExperienceClientView({ initialData }: ExperienceClientViewProps) {
  const { data: expData, isLoading } = useExperiences();
  const rawExperiences = expData?.data || initialData;

  // Sort experiences: strictly honor the admin's drag-and-drop sortOrder
  const sortedExperiences = React.useMemo(() => {
    const list = rawExperiences || [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawExperiences]);

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="CAREER & EXPERIENCE"
        title="Professional Experience & Technical Leadership"
        description="A comprehensive history of engineering roles, system architecture responsibilities, and distributed software solutions."
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
            href="/education"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Education</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/my-timeline"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Interactive Timeline</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/works"
            className="text-accent hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>Featured Works</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </PageHeader>

      {/* Main Experience Content */}
      <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        {isLoading && sortedExperiences.length === 0 ? (
          <div className="flex flex-col gap-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : sortedExperiences.length > 0 ? (
          sortedExperiences.map((exp, idx) => {
            const startDate = exp.startDate
              ? new Date(exp.startDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
              : '';
            const endDate = exp.isCurrent
              ? 'Present'
              : exp.endDate
                ? new Date(exp.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
                : '';

            const sectionNum = String(idx + 1).padStart(2, '0');

            return (
              <SplitSection
                key={exp.id}
                labelNumber={`${sectionNum} // ROLE`}
                labelTitle={exp.role}
                labelSubtitle={exp.companyName}
                id={`exp-${exp.id}`}
              >
                <RevealOnScroll>
                  <div className="flex flex-col gap-4 bg-surface border border-border rounded-lg p-6 md:p-8">
                    {/* Header: Role + Company + Tenure */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-foreground">{exp.role}</h3>
                          <span className="text-muted text-xs">@</span>
                          <span className="text-accent font-semibold text-sm">
                            {exp.companyName}
                          </span>
                          {exp.isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-success/10 text-success border border-success/30 rounded-xs font-semibold">
                              CURRENT POSITION
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted pt-1">
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

                      {exp.companyUrl && (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted hover:text-accent flex items-center gap-1 font-mono shrink-0 transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>Visit Company</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {/* Description */}
                    {exp.description && (
                      <div className="text-sm text-foreground/90 leading-relaxed">
                        <MarkdownRenderer content={exp.description} />
                      </div>
                    )}

                    {/* Technologies */}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">
                          Core Technologies & Tools
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {exp.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" size="sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Single View Deep Dive Link */}
                    <div className="pt-2">
                      <Link
                        href={`/experience/${exp.id}`}
                        className="text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View Role Details & Summary</span>
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
            No career experience entries available yet.
          </div>
        )}
      </div>
    </div>
  );
}
