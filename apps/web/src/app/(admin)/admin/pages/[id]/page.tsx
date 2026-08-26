'use client';

import React, { useEffect, useState, use } from 'react';
import { apiClient } from '@/lib/api';
import type { PageDto } from '@portfolio/shared';
import { PageEditorForm } from '@/components/admin/features/pages/PageEditorForm';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await apiClient.get<{ data: PageDto }>(`/pages/admin/${resolvedParams.id}`);
        setPage(res.data);
      } catch {
        toast.error('Failed to load page');
      } finally {

        setIsLoading(false);
      }
    }

    loadPage();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Loading Dynamic Page...
        </span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="py-24 text-center text-muted">
        <p className="text-sm font-semibold text-foreground">Page not found</p>
      </div>
    );
  }

  return <PageEditorForm initialData={page} />;
}
