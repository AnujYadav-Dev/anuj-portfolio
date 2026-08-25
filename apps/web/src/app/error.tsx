'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to error reporting service
    console.error('Unhandled Client Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-lg border border-border bg-surface p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-mono text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>HTTP_STATUS // 500 APPLICATION_ERROR</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-xs text-muted leading-relaxed font-mono">
            {error.message || 'An unexpected exception occurred during page rendering.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm" leftIcon={<Home className="h-3.5 w-3.5" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
