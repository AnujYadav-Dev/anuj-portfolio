'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useEasterEggTrigger } from '@/hooks/useEasterEggTrigger';
import { cn } from '@/lib/cn';

export interface FooterThemeControlProps {
  className?: string;
}

export function FooterThemeControl({ className }: FooterThemeControlProps) {
  const { theme, setTheme } = useTheme();
  const { registerClick } = useEasterEggTrigger();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-0.5 p-1 rounded-full bg-surface border border-border h-8 select-none',
          className,
        )}
      >
        <span className="w-6 h-6 rounded-full" />
        <span className="w-6 h-6 rounded-full" />
        <span className="w-6 h-6 rounded-full" />
      </div>
    );
  }

  const options = [
    { value: 'system', label: 'System Theme', icon: Monitor },
    { value: 'light', label: 'Light Mode', icon: Sun },
    { value: 'dark', label: 'Dark Mode', icon: Moon },
  ] as const;

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={cn(
        'inline-flex items-center gap-0.5 p-0.5 rounded-full bg-surface border border-border shadow-xs select-none transition-colors',
        className,
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => registerClick(() => setTheme(opt.value))}
            aria-pressed={isActive}
            aria-label={opt.label}
            title={opt.label}
            className={cn(
              'relative p-1.5 rounded-full transition-all duration-fast flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
              isActive
                ? 'bg-surface-muted text-accent shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-muted/50',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
