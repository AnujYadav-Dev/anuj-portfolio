'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { useExperiences } from '@/hooks/useProfile';
import type { DynamicSectionProps } from './types';

export function ExperienceHighlights({ section, index }: DynamicSectionProps) {
  const limit = (section?.config?.limit as number) || 3;
  const { data: expData } = useExperiences();
  const rawExperiences = expData?.data;

  const sectionTitle = section?.title || 'Career Journey';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Roles & Professional Experience';

  // Dynamic sequential numbering with customizable tag & separator
  const sectionNumber = String(index ?? 1).padStart(2, '0');
  const tag = (section?.config?.labelTag as string) || 'JOURNEY';
  const separator = (section?.config?.tagSeparator as string) ?? '//';
  const labelNumber = (section?.config?.labelNumber as string) || `${sectionNumber} ${separator} ${tag}`;

  const ctaLabel =
    (section?.config?.ctaLabel as string) || 'Explore Full Career History & Timeline';
  const ctaUrl = (section?.config?.ctaUrl as string) || '/experience';
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';

  // Dynamically sort: strictly honor the admin's drag-and-drop sortOrder
  const sortedExperiences = React.useMemo(() => {
    const list = rawExperiences || [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawExperiences]);

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id="experience"
    >
      <div className="flex flex-col gap-6 max-w-3xl">
        {sortedExperiences.length > 0 ? (
          sortedExperiences.slice(0, limit).map((exp, idx) => {
            const startDate = new Date(exp.startDate).getFullYear();
            const endDate = exp.isCurrent
              ? 'Present'
              : exp.endDate
                ? new Date(exp.endDate).getFullYear()
                : '';

            return (
              <RevealOnScroll key={exp.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <div className="flex flex-col gap-2 pb-6 border-b border-border/60 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/experience/${exp.id}`}
                        className="font-bold text-md text-foreground hover:text-accent transition-colors"
                      >
                        {exp.role}
                      </Link>
                      <span className="text-muted text-xs">@</span>
                      <span className="text-accent font-semibold text-xs">{exp.companyName}</span>
                      {exp.isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-success/10 text-success border border-success/30 rounded-xs">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted">
                      {startDate} — {endDate}
                    </span>
                  </div>

                  {exp.description && (
                    <div className="text-xs text-muted leading-relaxed line-clamp-3">
                      <MarkdownRenderer content={exp.description} />
                    </div>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.technologies.map((t) => (
                        <Badge key={t} variant="outline" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })
        ) : (
          <RevealOnScroll>
            <div className="flex flex-col gap-2 pb-6 border-b border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-md text-foreground">Lead Full Stack Engineer</span>
                <span className="text-xs font-mono text-muted">2024 — Present</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Architecting high-scale distributed systems and developer tools with TypeScript,
                Next.js, and PostgreSQL.
              </p>
            </div>
          </RevealOnScroll>
        )}

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
    </SplitSection>
  );
}
