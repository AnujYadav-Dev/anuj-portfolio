'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useSkillCategories, useSkills } from '@/hooks/useProfile';

export function SkillsOverview() {
  const { data: categoriesData } = useSkillCategories();
  const { data: skillsData } = useSkills();

  const categories = categoriesData?.data || [];
  const skills = skillsData?.data || [];

  return (
    <SplitSection
      labelNumber="03 // SKILLS"
      labelTitle="Technical Arsenal"
      labelSubtitle="Languages, Frameworks & Tooling"
    >
      <div className="flex flex-col gap-8 max-w-3xl">
        {categories.length > 0 ? (
          categories.map((category, idx) => {
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
            href="/skills"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 transition-colors"
          >
            <span>View Full Skills Matrix & Proficiencies</span>
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </SplitSection>
  );
}
