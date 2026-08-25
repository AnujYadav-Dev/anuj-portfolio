'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { ProjectCard } from '@/components/features/works/ProjectCard';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';

export default function AuthorWorksPage() {
  const params = useParams();
  const author = String(params?.author || '');

  const { data: projectsData, isLoading } = useProjects({
    pageSize: 50,
  });

  const allProjects = projectsData?.data || [];
  const authorProjects = allProjects.filter(
    (p) => p.author?.username?.toLowerCase() === author.toLowerCase(),
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        badge={`AUTHOR: @${author.toUpperCase()}`}
        title={`Works by ${author}`}
        description={`Showcase of software engineering projects and technical contributions by ${author}.`}
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-64 w-full rounded-md" />
              ))}
            </div>
          ) : authorProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorProjects.map((project, idx) => (
                <RevealOnScroll key={project.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <ProjectCard project={project} className="h-full" />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No projects found for author @{author}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
