'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { BlogReader } from '@/components/features/blogs/BlogReader';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogPostBySlug } from '@/hooks/useBlogPosts';

export default function SingleBlogPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const { data: blogData, isLoading, error } = useBlogPostBySlug(slug);
  const post = blogData?.data;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="text-xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-xs text-muted mt-2">The requested writing could not be located.</p>
      </div>
    );
  }

  return <BlogReader post={post} />;
}
