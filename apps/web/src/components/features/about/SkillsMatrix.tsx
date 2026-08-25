'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { SkillCategoryDto, SkillDto } from '@portfolio/shared';

export interface SkillsMatrixProps {
  categories: SkillCategoryDto[];
  skills: SkillDto[];
}

export function SkillsMatrix({ categories, skills }: SkillsMatrixProps) {
  const [activeCategory, setActiveCategory] = React.useState<string | undefined>();

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.slug === activeCategory)
    : categories;

  return (
    <div className="flex flex-col gap-8">
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
          <Badge
            variant={activeCategory === undefined ? 'accent' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(undefined)}
            className="cursor-pointer select-none"
          >
            All Disciplines
          </Badge>
          {categories.map((c) => (
            <Badge
              key={c.id}
              variant={activeCategory === c.slug ? 'accent' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(activeCategory === c.slug ? undefined : c.slug)}
              className="cursor-pointer select-none"
            >
              {c.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Categories Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map((category, idx) => {
          const categorySkills = skills
            .filter((s) => s.categoryId === category.id)
            .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));

          if (categorySkills.length === 0) return null;

          return (
            <RevealOnScroll key={category.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
              <Card className="bg-surface border-border h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono text-accent uppercase tracking-wider">
                      {category.name}
                    </CardTitle>
                    <span className="text-xs text-muted font-mono">
                      {categorySkills.length} skills
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-xs text-muted leading-relaxed mt-1">
                      {category.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{skill.name}</span>
                        {skill.proficiency && (
                          <span className="font-mono text-[11px] text-muted">
                            {skill.proficiency}%
                          </span>
                        )}
                      </div>

                      {/* Proficiency Track */}
                      {skill.proficiency && (
                        <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-slow"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </RevealOnScroll>
          );
        })}
      </div>
    </div>
  );
}
