'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, X, Briefcase, BookOpen, FileText, Code, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/hooks/useDiscovery';
import type { SearchType } from '@portfolio/shared';

export function SearchInterface() {
  const [query, setQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<SearchType>('all');

  const { data: searchData, isLoading } = useSearch({
    q: query,
    type: selectedType,
    limit: 25,
  });

  const results = searchData?.data?.results || [];
  const total = searchData?.data?.total || 0;

  const entityTypes: Array<{ label: string; value: SearchType }> = [
    { label: 'All Content', value: 'all' },
    { label: 'Projects', value: 'project' },
    { label: 'Blogs', value: 'blog_post' },
    { label: 'Research', value: 'research_paper' },
    { label: 'Skills', value: 'skill' },
    { label: 'Pages', value: 'page' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects, essays, research papers, technologies..."
          className="pl-10 h-12 text-sm bg-surface"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Entity Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {entityTypes.map((type) => (
          <Badge
            key={type.label}
            variant={selectedType === type.value ? 'accent' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type.value)}
            className="cursor-pointer select-none"
          >
            {type.label}
          </Badge>
        ))}
      </div>

      {/* Search Results List */}
      <div className="flex flex-col gap-4">
        {query.trim().length > 0 && (
          <div className="text-xs font-mono text-muted">
            Found {total} {total === 1 ? 'match' : 'matches'} for &quot;{query}&quot;
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-20 w-full rounded-md" />
            ))}
          </div>
        ) : results.length > 0 ? (
          results.map((item) => {
            let icon = <FileText className="h-4 w-4 text-muted" />;
            if (item.type === 'project') icon = <Briefcase className="h-4 w-4 text-accent" />;
            else if (item.type === 'blog_post') icon = <BookOpen className="h-4 w-4 text-accent" />;
            else if (item.type === 'research_paper') icon = <FileText className="h-4 w-4 text-accent" />;
            else if (item.type === 'skill') icon = <Code className="h-4 w-4 text-accent" />;

            return (
              <Link key={`${item.type}-${item.id}`} href={item.url}>
                <Card className="group bg-surface border-border hover:border-muted p-4 flex flex-col gap-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {item.type.toUpperCase()}
                      </Badge>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  {item.snippet && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 pl-6">
                      {item.snippet}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })
        ) : query.trim().length > 0 ? (
          <div className="py-16 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
            No results found for &quot;{query}&quot;. Try different keywords.
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
            Type a search query to explore the portfolio platform.
          </div>
        )}
      </div>
    </div>
  );
}
