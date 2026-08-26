'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { BlogListRow } from '@/components/features/blogs/BlogListRow';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogPosts } from '@/hooks/useBlogPosts';

interface AuthorBlogsClientViewProps {
  author: string;
}

export function AuthorBlogsClientView({ author }: AuthorBlogsClientViewProps) {
  const { data: blogsData, isLoading } = useBlogPosts({ pageSize: 50 });
  const allPosts = blogsData?.data || [];
  const authorPosts = allPosts.filter(
    (p) => p.author?.username?.toLowerCase() === author.toLowerCase(),
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        badge={`AUTHOR: @${author.toUpperCase()}`}
        title={`Articles by ${author}`}
        description={`Technical essays, tutorials, and architectural thoughts authored by ${author}.`}
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-16 w-full rounded-sm" />
              ))}
            </div>
          ) : authorPosts.length > 0 ? (
            <div className="flex flex-col border-t border-border">
              {authorPosts.map((post) => (
                <BlogListRow key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No articles found by author @{author}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
