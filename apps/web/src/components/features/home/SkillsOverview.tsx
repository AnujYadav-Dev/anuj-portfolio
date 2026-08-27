'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useSkillCategories, useSkills } from '@/hooks/useProfile';
import type { DynamicSectionProps } from './types';

export function SkillsOverview({ section, index }: DynamicSectionProps) {
  const limit = (section?.config?.limit as number) || 4;
  const { data: categoriesData } = useSkillCategories();
  const { data: skillsData } = useSkills();

  const categories = categoriesData?.data || [];
  const skills = skillsData?.data || [];

  const sectionTitle = section?.title || 'Technical Arsenal';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Languages, Frameworks & Tooling';

  // Dynamic sequential numbering with customizable tag & separator
  const sectionNumber = String(index ?? 1).padStart(2, '0');
  const tag = (section?.config?.labelTag as string) || 'SKILLS';
  const separator = (section?.config?.tagSeparator as string) ?? '//';
  const labelNumber = (section?.config?.labelNumber as string) || `${sectionNumber} ${separator} ${tag}`;

  const ctaLabel =
    (section?.config?.ctaLabel as string) || 'View Full Skills Matrix & Proficiencies';
  const ctaUrl = (section?.config?.ctaUrl as string) || '/skills';
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id="skills"
    >
      <div className="flex flex-col gap-8 max-w-3xl">
        {categories.length > 0 ? (
          categories.slice(0, limit).map((category, idx) => {
            const categorySkills = skills.filter((s) => s.categoryId === category.id);
            if (categorySkills.length === 0) return null;

            return (
              <RevealOnScroll key={category.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                    {category.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="default"
                        size="md"
                        className="hover:border-accent hover:text-foreground transition-colors cursor-default"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })
        ) : (
          <RevealOnScroll>
            <div className="flex flex-wrap gap-2">
              {[
                'TypeScript',
                'React',
                'Next.js',
                'Node.js',
                'Express',
                'PostgreSQL',
                'Prisma',
                'Tailwind CSS',
                'Docker',
                'Redis',
                'GraphQL',
                'AWS',
              ].map((skill) => (
                <Badge key={skill} variant="default" size="md">
                  {skill}
                </Badge>
              ))}
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
