'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ProjectCard } from '@/components/features/works/ProjectCard';
import { ProjectFilters } from '@/components/features/works/ProjectFilters';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';

export default function WorksPage() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string | undefined>();
  const [tag, setTag] = React.useState<string | undefined>();

  const { data: projectsData, isLoading } = useProjects({
    tag,
    pageSize: 50,
  });

  const allProjects = projectsData?.data || [];
  const projects = allProjects.filter((p) => {
    const matchesCategory = category ? p.category?.slug === category : true;
    const matchesSearch = search.trim()
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="PORTFOLIO & OPEN SOURCE"
        title="Works & Engineering Projects"
        description="Systems architecture, web platforms, open-source utilities, and developer tooling built for performance and scalability."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          {/* Filters */}
          <ProjectFilters
            search={search}
            onSearchChange={setSearch}
            selectedCategory={category}
            onCategoryChange={setCategory}
            selectedTag={tag}
            onTagChange={setTag}
          />

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-64 w-full rounded-md" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <RevealOnScroll key={project.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <ProjectCard project={project} className="h-full" />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No projects found matching the specified filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
