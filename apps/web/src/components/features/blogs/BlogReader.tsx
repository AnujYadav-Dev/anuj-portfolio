'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Share2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { TableOfContents, extractHeadings } from '@/components/content/TableOfContents';
import type { BlogPostDto } from '@portfolio/shared';
import { toast } from 'sonner';

export interface BlogReaderProps {
  post: BlogPostDto;
}

export function BlogReader({ post }: BlogReaderProps) {
  const headings = React.useMemo(() => extractHeadings(post.content), [post.content]);

  const publishDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Article link copied to clipboard');
      }
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShareTwitter = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleShareLinkedIn = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors select-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all writings</span>
          </Link>
        </div>

        {/* Squircle Mosaic Hero Backdrop */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-6 md:p-12 mb-12">
          {/* Subtle Squircle Mosaic Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-6 sm:grid-cols-12 gap-2 p-4"
            aria-hidden="true"
          >
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-md aspect-square ${i === 14 ? 'bg-accent opacity-90' : 'bg-surface-muted'}`}
              />
            ))}
          </div>

          <div className="relative z-1 flex flex-col gap-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <Badge variant="accent" size="sm">
                  {post.category.name}
                </Badge>
              )}
              {post.readingTimeMinutes && (
                <Badge variant="outline" size="sm">
                  {post.readingTimeMinutes} MIN READ
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-sm md:text-md text-muted leading-relaxed">{post.excerpt}</p>
            )}

            {/* Author and Date metadata */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-mono text-muted border-t border-border/60 mt-2">
              {post.author && (
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Avatar
                    src={post.author.avatarUrl}
                    fallbackText={post.author.displayName}
                    size="sm"
                  />
                  <span>{post.author.displayName}</span>
                </div>
              )}
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{publishDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Reading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left / Main Column: Prose Content */}
          <div className="lg:col-span-8 max-w-prose">
            <MarkdownRenderer content={post.content} />

            {/* Tags footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Badge key={t} variant="accent" size="sm">
                    #{t}
                  </Badge>
                ))}
              </div>
            )}

            {/* Share and Actions */}
            <div className="mt-8 p-4 rounded-md border border-border bg-surface flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-mono font-semibold text-foreground">
                SHARE THIS ARTICLE
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  leftIcon={<Copy className="h-3.5 w-3.5" />}
                >
                  Copy Link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareTwitter}
                  aria-label="Share on Twitter / X"
                  leftIcon={<Share2 className="h-3.5 w-3.5" />}
                >
                  Post
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareLinkedIn}
                  aria-label="Share on LinkedIn"
                >
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Author Bio Card */}
            {post.author && (
              <div className="mt-8 p-6 rounded-md border border-border bg-surface-muted/30 flex items-start gap-4">
                <Avatar
                  src={post.author.avatarUrl}
                  fallbackText={post.author.displayName}
                  size="lg"
                />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-sm text-foreground">
                    Written by {post.author.displayName}
                  </span>
                  <p className="text-muted leading-relaxed">
                    Software engineer and systems architect passionate about high-craft web systems
                    and distributed infrastructure.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Table of Contents Sidebar */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-6">
              <TableOfContents items={headings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
