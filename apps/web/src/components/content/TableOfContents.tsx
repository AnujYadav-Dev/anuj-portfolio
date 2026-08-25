'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const hashes = match[1];
    const text = match[2].trim();
    const level = hashes.length;
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    items.push({ id, text, level });
  }

  return items;
}

export function TableOfContents({ items, className }: { items: TocItem[]; className?: string }) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (items.length === 0 || typeof window === 'undefined') return;

    const handleScroll = () => {
      const headingElements = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 100;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          return;
        }
      }

      if (items[0]) {
        setActiveId(items[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn('rounded-md border border-border bg-surface p-4 text-xs', className)}
    >
      <div className="font-semibold text-foreground mb-3 text-[11px] uppercase tracking-wider">
        On this page
      </div>
      <ul className="space-y-1.5 list-none m-0 p-0">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={cn('transition-colors', item.level === 3 && 'pl-3 text-[11px]')}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    setActiveId(item.id);
                  }
                }}
                className={cn(
                  'block py-1 px-2 rounded-xs transition-colors',
                  isActive
                    ? 'bg-surface-muted text-accent font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/50',
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
