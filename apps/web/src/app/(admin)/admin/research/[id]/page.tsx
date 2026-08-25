'use client';

import React, { useEffect, useState, use } from 'react';
import { apiClient } from '@/lib/api';
import type { ResearchPaperDto } from '@portfolio/shared';
import { ResearchEditorForm } from '@/components/admin/features/research/ResearchEditorForm';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function AdminEditResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [paper, setPaper] = useState<ResearchPaperDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPaper() {
      try {
        const res = await apiClient.get<{ data: ResearchPaperDto }>(
          `/research/admin/${resolvedParams.id}`,
        );
        setPaper(res.data);
      } catch (err: any) {
        toast.error('Failed to load research paper');
      } finally {
        setIsLoading(false);
      }
    }

    loadPaper();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Loading Research Data...
        </span>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="py-24 text-center text-muted">
        <p className="text-sm font-semibold text-foreground">Paper not found</p>
      </div>
    );
  }

  return <ResearchEditorForm initialData={paper} />;
}
