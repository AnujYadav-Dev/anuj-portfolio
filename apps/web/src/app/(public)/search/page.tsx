'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInterface } from '@/components/features/search/SearchInterface';

export default function GlobalSearchPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        badge="GLOBAL DISCOVERY"
        title="Search the Platform"
        description="Instant multi-domain search across engineering projects, essays, research papers, technologies, and custom pages."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <SearchInterface />
        </div>
      </div>
    </div>
  );
}
