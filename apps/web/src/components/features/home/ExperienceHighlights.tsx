'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Building2, Calendar } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useExperiences } from '@/hooks/useProfile';

export function ExperienceHighlights() {
  const { data: expData } = useExperiences();
  const experiences = expData?.data || [];

  return (
    <SplitSection
      labelNumber="04 // JOURNEY"
      labelTitle="Career Journey"
      labelSubtitle="Roles & Experience"
    >
      <div className="flex flex-col gap-6 max-w-3xl">
        {experiences.length > 0 ? (
          experiences.slice(0, 3).map((exp, idx) => {
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
                      <span className="font-bold text-md text-foreground">{exp.role}</span>
                      <span className="text-muted text-xs">@</span>
                      <span className="text-accent font-semibold text-xs">{exp.companyName}</span>
                    </div>
                    <span className="text-xs font-mono text-muted">
                      {startDate} — {endDate}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-muted leading-relaxed">{exp.description}</p>
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
            href="/my-timeline"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 transition-colors"
          >
            <span>Explore Full Interactive Journey Timeline</span>
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </SplitSection>
  );
}
