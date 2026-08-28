'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, BookOpen, FileText } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useResearchPapers } from '@/hooks/useResearch';
import { cn } from '@/lib/cn';
import { formatSectionTag, type DynamicSectionProps } from './types';

export function LatestBlogsSection({ section, index }: DynamicSectionProps) {
  const limit = (section?.config?.limit as number) || 5;
  const includeResearch = section?.config?.includeResearch !== false;

  const { data: blogsData } = useBlogPosts({ pageSize: limit });
  const { data: researchData } = useResearchPapers({ pageSize: 3 });

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const sectionTitle = section?.title || 'Latest Writing & Research';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Articles, Whitepapers & Architecture Notes';

  const labelNumber = formatSectionTag({
    index,
    showSectionNumber: section?.config?.showSectionNumber !== false,
    labelTag: (section?.config?.labelTag as string) || 'WRITINGS',
    tagSeparator: (section?.config?.tagSeparator as string) ?? '//',
    customLabelNumber: section?.config?.labelNumber as string,
  });

  const ctaLabel =
    (section?.config?.ctaLabel as string) ||
    `All Articles (${blogsData?.pagination?.totalItems ?? 0})`;
  const ctaUrl = (section?.config?.ctaUrl as string) || '/blogs';
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';

  // Combine posts and research papers sorted by publication date
  type CombinedItem = {
    id: string;
    title: string;
    slug: string;
    type: 'blog' | 'research';
    excerpt?: string | null;
    categoryName?: string;
    readingTimeMinutes?: number | null;
    publishedAt?: string | null;
  };

  const combinedItems: CombinedItem[] = React.useMemo(() => {
    const posts = blogsData?.data || [];
    const researchPapers = includeResearch ? researchData?.data || [] : [];
    const list: CombinedItem[] = [
      ...posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: `/blogs/${p.slug}`,
        type: 'blog' as const,
        excerpt: p.excerpt,
        categoryName: p.category?.name,
        readingTimeMinutes: p.readingTimeMinutes,
        publishedAt: p.publishedAt,
      })),
      ...researchPapers.map((r) => ({
        id: r.id,
        title: r.title,
        slug: `/research/${r.slug}`,
        type: 'research' as const,
        excerpt: r.abstract,
        categoryName: 'Research Paper',
        readingTimeMinutes: null,
        publishedAt: r.publishedAt,
      })),
    ];

    list.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    return list.slice(0, limit);
  }, [blogsData?.data, researchData?.data, includeResearch, limit]);

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id="blogs"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
            LATEST WRITINGS
          </h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href={ctaUrl}
              target={ctaTarget === '_blank' ? '_blank' : undefined}
              rel={ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
              className="text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 flex items-center gap-1 transition-colors"
            >
              <span>{ctaLabel}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            {includeResearch && (researchData?.pagination?.totalItems ?? 0) > 0 && (
              <Link
                href="/research"
                className="text-muted hover:text-foreground underline decoration-border hover:decoration-muted underline-offset-4 flex items-center gap-1 hidden sm:flex transition-colors"
              >
                <span>Research ({researchData?.pagination?.totalItems ?? 0})</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Blog Row Streams with hover-expand interaction */}
        <div className="flex flex-col border-t border-border">
          {combinedItems.length > 0 ? (
            combinedItems.map((item, idx) => {
              const isHovered = hoveredId === item.id;
              const publishDate = item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

              return (
                <RevealOnScroll key={item.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <Link
                    href={item.slug}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'group block py-4 border-b border-border transition-all duration-fast cursor-pointer',
                      isHovered && 'bg-surface/50 px-3 -mx-3 rounded-sm',
                    )}
                  >
                    {/* Primary Row Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.type === 'research' ? (
                          <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
                        ) : (
                          <BookOpen className="h-3.5 w-3.5 text-muted group-hover:text-accent transition-colors shrink-0" />
                        )}
                        <span className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors truncate">
                          {item.title}
                        </span>
                        {item.categoryName && (
                          <span className="text-xs text-muted italic shrink-0 hidden sm:inline">
                            in {item.categoryName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-muted">
                        {item.readingTimeMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.readingTimeMinutes} min
                          </span>
                        )}
                        {publishDate && <span>{publishDate}</span>}
                      </div>
                    </div>

                    {/* Expandable Hover Details */}
                    {isHovered && item.excerpt && (
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-instant">
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                      </div>
                    )}
                  </Link>
                </RevealOnScroll>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted font-mono">
              No publications available yet.
            </div>
          )}
        </div>
      </div>
    </SplitSection>
  );
}
