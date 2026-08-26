'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import type { NavItemDto } from '@portfolio/shared';
import { NavIcon } from './NavIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export interface SplitNavButtonProps {
  item: NavItemDto;
  pathname: string;
}

export function SplitNavButton({ item, pathname }: SplitNavButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const hasChildren = item.children && item.children.length > 0;
  const variant = (item.config?.buttonVariant as string) || 'primary';
  const hotkey = item.config?.hotkey ? String(item.config.hotkey) : null;

  // Click-outside and Escape key listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Variant styling definitions with high-contrast text rules
  const variantStyles = React.useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          wrapper: 'bg-surface-muted border-border hover:bg-surface-muted/80 text-foreground',
          link: '!text-foreground hover:!text-accent font-medium',
          iconColor: 'text-accent',
          splitBorder: 'border-border',
          chevron: '!text-muted hover:!text-foreground',
          kbd: 'bg-surface text-muted border-border',
        };
      case 'outline':
        return {
          wrapper:
            'bg-transparent border-border hover:border-accent text-foreground hover:text-accent',
          link: '!text-foreground hover:!text-accent font-medium',
          iconColor: 'text-accent',
          splitBorder: 'border-border',
          chevron: '!text-muted hover:!text-foreground',
          kbd: 'bg-surface-muted text-muted border-border',
        };
      case 'primary':
      default:
        return {
          wrapper:
            'bg-accent border-accent text-black font-semibold hover:bg-accent-hover shadow-sm',
          link: '!text-black hover:!text-black font-bold',
          iconColor: 'text-black',
          splitBorder: 'border-black/25',
          chevron: '!text-black hover:!text-black',
          kbd: 'bg-black/15 text-black border-black/20',
        };
    }
  }, [variant]);

  // If no children, render as a single direct action CTA button
  if (!hasChildren) {
    return (
      <Link
        href={item.url || '#'}
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
        className={cn(
          'inline-flex items-center gap-1.5 h-8 px-3.5 rounded-sm border text-xs transition-all select-none',
          variantStyles.wrapper,
          variantStyles.link,
        )}
      >
        {item.icon && (
          <NavIcon
            name={item.icon}
            className={cn('w-3.5 h-3.5 shrink-0', variantStyles.iconColor)}
          />
        )}
        <span>{item.label}</span>
        {hotkey && (
          <kbd
            className={cn(
              'hidden xl:inline px-1 py-0.2 text-[9px] font-mono rounded-xs border',
              variantStyles.kbd,
            )}
          >
            {hotkey}
          </kbd>
        )}
        {item.isExternal && <ArrowUpRight className="w-3 h-3 shrink-0" />}
      </Link>
    );
  }

  // Split Action Button (Main Link + Dropdown Trigger)
  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <div
        className={cn(
          'inline-flex items-stretch rounded-sm border overflow-hidden transition-all select-none',
          variantStyles.wrapper,
          isOpen && 'ring-1 ring-accent',
        )}
      >
        {/* Left Segment: Primary Action Link */}
        <Link
          href={item.url || '#'}
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-90 outline-none select-none',
            variantStyles.link,
          )}
        >
          {item.icon && (
            <NavIcon
              name={item.icon}
              className={cn('w-3.5 h-3.5 shrink-0', variantStyles.iconColor)}
            />
          )}
          <span>{item.label}</span>
          {hotkey && (
            <kbd
              className={cn(
                'hidden xl:inline px-1 py-0.2 text-[9px] font-mono rounded-xs border',
                variantStyles.kbd,
              )}
            >
              {hotkey}
            </kbd>
          )}
        </Link>

        {/* Vertical Split Divider */}
        <div className={cn('w-[1px] my-1', variantStyles.splitBorder)} />

        {/* Right Segment: Chevron Dropdown Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`Open ${item.label} quick actions`}
          className={cn(
            'px-2 flex items-center justify-center transition-colors cursor-pointer outline-none hover:bg-black/10',
            variantStyles.chevron,
            isOpen && 'bg-black/15',
          )}
        >
          <ChevronDown
            className={cn('w-3.5 h-3.5 transition-transform duration-fast', isOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Quick Action Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label={`${item.label} quick actions`}
          className="absolute right-0 top-full pt-2 z-dropdown min-w-[240px] max-w-[300px] animate-in fade-in-0 zoom-in-95 duration-fast"
        >
          <div className="bg-surface border border-border rounded-lg p-2.5 shadow-2xl backdrop-blur-md">
            <div className="px-2 py-1 mb-1 border-b border-border/50">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted font-mono">
                Quick Actions
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {item.children.map((child) => {
                if (child.itemType === 'divider') {
                  return <hr key={child.id} className="border-t border-border/50 my-1" />;
                }

                if (child.itemType === 'group') {
                  return (
                    <div key={child.id} className="pt-1.5 first:pt-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted font-mono px-2 block mb-1">
                        {child.label}
                      </span>
                      <div className="flex flex-col gap-1">
                        {child.children?.map((subChild) => (
                          <Link
                            key={subChild.id}
                            href={subChild.url || '#'}
                            target={subChild.isExternal ? '_blank' : undefined}
                            rel={subChild.isExternal ? 'noopener noreferrer' : undefined}
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                            className={cn(
                              'group flex items-start gap-2 p-1.5 rounded-sm text-xs transition-colors',
                              pathname === subChild.url
                                ? 'bg-surface-muted !text-accent font-semibold'
                                : '!text-muted hover:!text-foreground hover:bg-surface-muted/60',
                            )}
                          >
                            {subChild.icon && (
                              <NavIcon
                                name={subChild.icon}
                                className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-medium !text-foreground group-hover:!text-accent transition-colors">
                                {subChild.label}
                              </span>
                              {subChild.description && (
                                <p className="text-[10px] text-muted line-clamp-1 mt-0.5">
                                  {subChild.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={child.id}
                    href={child.url || '#'}
                    target={child.isExternal ? '_blank' : undefined}
                    rel={child.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      'group flex items-start gap-2 p-2 rounded-sm text-xs transition-colors',
                      pathname === child.url
                        ? 'bg-surface-muted !text-accent font-semibold'
                        : '!text-muted hover:!text-foreground hover:bg-surface-muted/60',
                    )}
                  >
                    {child.icon && (
                      <NavIcon
                        name={child.icon}
                        className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium !text-foreground group-hover:!text-accent transition-colors">
                          {child.label}
                        </span>
                        {child.badge && (
                          <Badge variant="outline" size="sm">
                            {child.badge}
                          </Badge>
                        )}
                        {child.isExternal && (
                          <ArrowUpRight className="w-3 h-3 text-muted group-hover:text-accent transition-transform" />
                        )}
                      </div>

                      {child.description && (
                        <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-tight">
                          {child.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
