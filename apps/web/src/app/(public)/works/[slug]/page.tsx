'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ProjectCaseStudy } from '@/components/features/works/ProjectCaseStudy';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectBySlug } from '@/hooks/useProjects';

export default function SingleProjectPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const { data: projectData, isLoading, error } = useProjectBySlug(slug);
  const project = projectData?.data;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="text-xl font-bold text-foreground">Project Not Found</h2>
        <p className="text-xs text-muted mt-2">
          The requested project case study could not be located.
        </p>
      </div>
    );
  }

  return <ProjectCaseStudy project={project} />;
}
