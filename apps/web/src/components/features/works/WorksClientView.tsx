'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { ProjectCard } from '@/components/features/works/ProjectCard';
import { ProjectFilters } from '@/components/features/works/ProjectFilters';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/useProjects';

export function WorksClientView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial filter values from URL search params
  const urlCategory = searchParams.get('category') || undefined;
  const urlTag = searchParams.get('tag') || undefined;
  const urlSearch = searchParams.get('q') || searchParams.get('search') || '';

  const [search, setSearch] = React.useState(urlSearch);
  const [category, setCategory] = React.useState<string | undefined>(urlCategory);
  const [tag, setTag] = React.useState<string | undefined>(urlTag);

  // Synchronize internal state when browser back/forward occurs
  React.useEffect(() => {
    setCategory(searchParams.get('category') || undefined);
    setTag(searchParams.get('tag') || undefined);
    setSearch(searchParams.get('q') || searchParams.get('search') || '');
  }, [searchParams]);

  // Synchronize state changes to URL query parameters
  const updateUrlParams = React.useCallback(
    (newCat?: string, newTag?: string, newSearch?: string) => {
      const params = new URLSearchParams();
      if (newCat) params.set('category', newCat);
      if (newTag) params.set('tag', newTag);
      if (newSearch && newSearch.trim()) params.set('q', newSearch.trim());

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  const handleCategoryChange = (newCat: string | undefined) => {
    setCategory(newCat);
    updateUrlParams(newCat, tag, search);
  };

  const handleTagChange = (newTag: string | undefined) => {
    setTag(newTag);
    updateUrlParams(category, newTag, search);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    updateUrlParams(category, tag, newSearch);
  };

  const { data: projectsData, isLoading } = useProjects({
    pageSize: 50,
  });

  const allProjects = projectsData?.data || [];
  const projects = allProjects.filter((p) => {
    const matchesCategory = category
      ? p.category?.slug.toLowerCase() === category.toLowerCase() ||
        p.category?.name.toLowerCase() === category.toLowerCase()
      : true;

    const matchesTag = tag
      ? p.technologies.some((t) => t.toLowerCase() === tag.toLowerCase())
      : true;

    const matchesSearch = search.trim()
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      : true;

    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="PORTFOLIO & OPEN SOURCE"
        title="Works & Engineering Projects"
        description="Systems architecture, web platforms, open-source utilities, and developer tooling built for performance and scalability."
      />

      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          {/* Filters */}
          <ProjectFilters
            search={search}
            onSearchChange={handleSearchChange}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            selectedTag={tag}
            onTagChange={handleTagChange}
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
              {projects.map((project) => (
                <RevealOnScroll key={project.id}>
                  <ProjectCard project={project} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No projects found matching the current search filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

