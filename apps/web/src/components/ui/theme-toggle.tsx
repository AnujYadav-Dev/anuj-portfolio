'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-9 w-9 rounded-sm border border-border bg-surface flex items-center justify-center text-muted',
          className,
        )}
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'h-9 w-9 rounded-sm border border-border bg-surface hover:bg-surface-muted hover:border-accent flex items-center justify-center text-foreground hover:text-accent transition-all duration-fast cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent select-none',
        className,
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-accent transition-transform duration-fast hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-foreground transition-transform duration-fast hover:-rotate-12" />
      )}
    </button>
  );
}
