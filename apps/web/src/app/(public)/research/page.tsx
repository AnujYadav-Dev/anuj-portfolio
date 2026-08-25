'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ResearchPaperCard } from '@/components/features/research/ResearchPaperCard';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { useResearchPapers } from '@/hooks/useResearch';

export default function ResearchPage() {
  const { data: researchData, isLoading } = useResearchPapers({ pageSize: 50 });
  const papers = researchData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="ACADEMIC & TECHNICAL RESEARCH"
        title="Research Papers & Publications"
        description="Formal publications, conference proceedings, preprints, and research inquiries into distributed architectures and computing."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-64 w-full rounded-md" />
              ))}
            </div>
          ) : papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {papers.map((paper, idx) => (
                <RevealOnScroll key={paper.id} delayIndex={(idx % 4 + 1) as 1 | 2 | 3 | 4}>
                  <ResearchPaperCard paper={paper} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No research papers published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
