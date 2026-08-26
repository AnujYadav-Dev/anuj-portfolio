'use client';

import React, { useEffect, useState, use } from 'react';
import { apiClient } from '@/lib/api';
import type { BlogPostDto } from '@portfolio/shared';
import { BlogEditorForm } from '@/components/admin/features/blogs/BlogEditorForm';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function AdminEditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [blog, setBlog] = useState<BlogPostDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBlog() {
      try {
        const res = await apiClient.get<{ data: BlogPostDto }>(`/blogs/admin/${resolvedParams.id}`);
        setBlog(res.data);
      } catch {
        toast.error('Failed to load blog post');
      } finally {

        setIsLoading(false);
      }
    }

    loadBlog();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Loading Article Data...
        </span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-24 text-center text-muted">
        <p className="text-sm font-semibold text-foreground">Blog post not found</p>
      </div>
    );
  }

  return <BlogEditorForm initialData={blog} />;
}
