'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BlogPostListItemDto } from '@portfolio/shared';
import { cn } from '@/lib/cn';

export interface BlogListRowProps {
  post: BlogPostListItemDto;
  className?: string;
}

export function BlogListRow({ post, className }: BlogListRowProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const postUrl = post.author?.username
    ? `/blogs/by/${post.author.username}/${post.slug}`
    : `/blogs/${post.slug}`;

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Link
      href={postUrl}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group block py-4 border-b border-border transition-all duration-fast cursor-pointer',
        isHovered && 'bg-surface/50 px-3 -mx-3 rounded-sm',
        className,
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
              {post.readingTimeMinutes} min read
            </span>
          )}
          {publishDate && <span>{publishDate}</span>}
        </div>
      </div>

      {/* Expandable Details on Hover */}
      {isHovered && post.excerpt && (
        <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-instant">
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">{post.excerpt}</p>
        </div>
      )}
    </Link>
  );
}
