'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProjectCategories } from '@/hooks/useProjects';
import { useTags } from '@/hooks/useDiscovery';

export interface ProjectFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  selectedTag: string | undefined;
  onTagChange: (tag: string | undefined) => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
}: ProjectFiltersProps) {
  const { data: categoriesData } = useProjectCategories();
  const { data: tagsData } = useTags();

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data?.slice(0, 10) || [];

  return (
    <div className="flex flex-col gap-4 pb-8 border-b border-border">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by title, stack, or keyword..."
            className="pl-9 h-10 text-xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory || selectedTag || search) && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange(undefined);
              onTagChange(undefined);
            }}
            className="text-xs text-muted hover:text-accent underline underline-offset-4 cursor-pointer font-mono"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-muted mr-1">Category:</span>
          <Badge
            variant={selectedCategory === undefined ? 'accent' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
            className="cursor-pointer select-none"
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.slug ? 'accent' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(selectedCategory === cat.slug ? undefined : cat.slug)}
              className="cursor-pointer select-none"
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Technology Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono text-muted mr-1">Tag:</span>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTag === tag.slug ? 'accent' : 'default'}
              size="sm"
              onClick={() => onTagChange(selectedTag === tag.slug ? undefined : tag.slug)}
              className="cursor-pointer select-none"
            >
              #{tag.name} ({tag.count})
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
