'use client';

import * as React from 'react';
import Link from 'next/link';
import { RssIcon } from '@/components/common/Icons';
import { Map, Activity, Copy, Check, ArrowUp, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export interface FooterDeveloperHubProps {
  authorEmail?: string;
  className?: string;
}

export function FooterDeveloperHub({
  authorEmail = 'anuj@example.com',
  className,
}: FooterDeveloperHubProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(authorEmail);
      setCopied(true);
      toast.success(`Copied ${authorEmail} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy email');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 py-4 border-t border-border/60 text-xs text-muted font-mono',
        className,
      )}
    >
      {/* Developer Feeds & System Status */}
      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        {/* Live System Status Pill */}
        {/* <Link
          href="/stats"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface border border-border hover:border-success/60 text-foreground transition-colors group"
          title="Inspect System Stats & Telemetry"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[10px] uppercase font-semibold text-muted group-hover:text-foreground">
            API Online
          </span>
        </Link> */}

        {/* RSS 2.0 Feed */}
        <Link
          href="/feed.xml"
          target="_blank"
          className="inline-flex items-center gap-1 hover:text-accent transition-colors"
          title="Subscribe via RSS 2.0 Syndication Feed"
        >
          <RssIcon className="w-3 h-3 text-accent" />
          <span>RSS 2.0</span>
        </Link>

        {/* XML Sitemap */}
        <Link
          href="/sitemap.xml"
          target="_blank"
          className="inline-flex items-center gap-1 hover:text-accent transition-colors"
          title="View Machine-Readable XML Sitemap"
        >
          <Map className="w-3 h-3 text-muted" />
          <span>Sitemap</span>
        </Link>

        {/* Robots.txt Indexing Policy */}
        <Link
          href="/robots.txt"
          target="_blank"
          className="inline-flex items-center gap-1 hover:text-accent transition-colors"
          title="View Web Crawler Indexing Rules (robots.txt)"
        >
          <Bot className="w-3 h-3 text-muted" />
          <span>Robots.txt</span>
        </Link>

        {/* Public Telemetry Stats */}
        <Link
          href="/stats"
          className="inline-flex items-center gap-1 hover:text-accent transition-colors"
          title="Platform Metrics & Telemetry"
        >
          <Activity className="w-3 h-3 text-muted" />
          <span>Telemetry</span>
        </Link>
      </div>

      {/* Copy Email & Back To Top Action */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopyEmail}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border hover:border-accent text-muted hover:text-foreground text-[11px] transition-all cursor-pointer select-none"
          title="Click to copy email address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-success" />
          ) : (
            <Copy className="w-3 h-3 text-muted" />
          )}
          <span>{authorEmail}</span>
        </button>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1 text-[11px] hover:text-accent transition-colors p-1 cursor-pointer select-none"
          title="Back to Top of Page"
          aria-label="Scroll back to top"
        >
          <span>Top</span>
          <ArrowUp className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
