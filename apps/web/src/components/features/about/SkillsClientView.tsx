'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SkillsMatrix } from '@/components/features/about/SkillsMatrix';
import { Skeleton } from '@/components/ui/skeleton';
import { useSkillCategories, useSkills } from '@/hooks/useProfile';

export function SkillsClientView() {
  const { data: categoriesData, isLoading: isCatLoading } = useSkillCategories();
  const { data: skillsData, isLoading: isSkillsLoading } = useSkills();

  const categories = categoriesData?.data || [];
  const skills = skillsData?.data || [];
  const isLoading = isCatLoading || isSkillsLoading;

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="TECHNICAL ARSENAL & PROFICIENCIES"
        title="Skills, Technologies & Tools"
        description="Comprehensive technical disciplines, language proficiencies, frameworks, databases, and DevOps tooling."
      />

      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-64 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <SkillsMatrix categories={categories} skills={skills} />
          )}
        </div>
      </div>
    </div>
  );
}
