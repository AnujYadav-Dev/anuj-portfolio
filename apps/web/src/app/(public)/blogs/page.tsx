'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { BlogListRow } from '@/components/features/blogs/BlogListRow';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlogPosts';
import { useTags } from '@/hooks/useDiscovery';
import { Search, X } from 'lucide-react';

export default function BlogsPage() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string | undefined>();
  const [tag, setTag] = React.useState<string | undefined>();

  const { data: blogsData, isLoading } = useBlogPosts({
    tag,
    pageSize: 50,
  });

  const { data: categoriesData } = useBlogCategories();
  const { data: tagsData } = useTags();

  const allPosts = blogsData?.data || [];
  const posts = allPosts.filter((p) => {
    const matchesCategory = category ? p.category?.slug === category : true;
    const matchesSearch = search.trim()
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });
  const categories = categoriesData?.data || [];
  const tags = tagsData?.data?.slice(0, 8) || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="WRITINGS & PUBLICATIONS"
        title="Technical Essays & Architecture Notes"
        description="Deep dives on distributed systems, modern React paradigms, TypeScript abstractions, and backend engineering."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          {/* Search and Category Filters */}
          <div className="flex flex-col gap-4 pb-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by title, content, or tag..."
                className="pl-9 h-10 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category selection */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted mr-1">Category:</span>
                <Badge
                  variant={category === undefined ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(undefined)}
                  className="cursor-pointer select-none"
                >
                  All
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={category === cat.slug ? 'accent' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(category === cat.slug ? undefined : cat.slug)}
                    className="cursor-pointer select-none"
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Tags selection */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-mono text-muted mr-1">Tag:</span>
                {tags.map((t) => (
                  <Badge
                    key={t.id}
                    variant={tag === t.slug ? 'accent' : 'default'}
                    size="sm"
                    onClick={() => setTag(tag === t.slug ? undefined : t.slug)}
                    className="cursor-pointer select-none"
                  >
                    #{t.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Blog Rows List */}
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <Skeleton key={n} className="h-16 w-full rounded-sm" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="flex flex-col border-t border-border">
              {posts.map((post) => (
                <BlogListRow key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No articles found matching the current search filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
