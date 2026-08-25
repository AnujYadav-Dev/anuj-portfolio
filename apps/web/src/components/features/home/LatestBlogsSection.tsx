'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { cn } from '@/lib/cn';

export function LatestBlogsSection() {
  const { data: blogsData } = useBlogPosts({ pageSize: 5 });
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const posts = blogsData?.data || [];

  return (
    <SplitSection
      labelNumber="05 // WRITINGS"
      labelTitle="Recent Essays"
      labelSubtitle="Articles, Tutorials & Architecture Notes"
      id="blogs"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
            LATEST WRITINGS
          </h3>
          <Link
            href="/blogs"
            className="text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 flex items-center gap-1"
          >
            <span>All Articles ({blogsData?.pagination?.totalItems ?? 0})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Blog Row Streams with hover-expand interaction */}
        <div className="flex flex-col border-t border-border">
          {posts.length > 0 ? (
            posts.map((post, idx) => {
              const isHovered = hoveredId === post.id;
              const publishDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '';

              return (
                <RevealOnScroll key={post.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <Link
                    href={`/blogs/${post.slug}`}
                    onMouseEnter={() => setHoveredId(post.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'group block py-4 border-b border-border transition-all duration-fast cursor-pointer',
                      isHovered && 'bg-surface/50 px-3 -mx-3 rounded-sm',
                    )}
                  >
                    {/* Primary Row Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors truncate">
                          {post.title}
                        </span>
                        {post.category && (
                          <span className="text-xs text-muted italic shrink-0 hidden sm:inline">
                            in {post.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-muted">
                        {post.readingTimeMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readingTimeMinutes} min
                          </span>
                        )}
                        {publishDate && <span>{publishDate}</span>}
                      </div>
                    </div>

                    {/* Expandable Hover Details */}
                    {isHovered && post.excerpt && (
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-instant">
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    )}
                  </Link>
                </RevealOnScroll>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted font-mono">
              No articles published yet. Stay tuned!
            </div>
          )}
        </div>
      </div>
    </SplitSection>
  );
}
