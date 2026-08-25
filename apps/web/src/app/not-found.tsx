import * as React from 'react';
import Link from 'next/link';
import { Terminal, ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-lg border border-border bg-surface p-8 shadow-2xl flex flex-col gap-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-destructive" />
            <span>HTTP_STATUS // 404</span>
          </div>
          <span className="text-destructive font-semibold">NOT_FOUND</span>
        </div>

        {/* ASCII / Error display */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
            404: Route Not Found
          </h1>
          <p className="text-xs text-muted leading-relaxed font-mono">
            The target resource or route could not be resolved in the application matrix.
          </p>
        </div>

        {/* Navigational Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/">
            <Button variant="primary" size="sm" leftIcon={<Home className="h-3.5 w-3.5" />}>
              Return Home
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="sm" leftIcon={<Search className="h-3.5 w-3.5" />}>
              Search Platform
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
