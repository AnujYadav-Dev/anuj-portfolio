'use client';

import React, { useEffect, useState, use } from 'react';
import { apiClient } from '@/lib/api';
import type { ProjectDto } from '@portfolio/shared';
import { ProjectEditorForm } from '@/components/admin/features/works/ProjectEditorForm';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function AdminEditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await apiClient.get<{ data: ProjectDto }>(
          `/projects/admin/${resolvedParams.id}`,
        );
        setProject(res.data);
      } catch (err: any) {
        toast.error('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Loading Project Data...
        </span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center text-muted">
        <p className="text-sm font-semibold text-foreground">Project not found</p>
      </div>
    );
  }

  return <ProjectEditorForm initialData={project} />;
}
