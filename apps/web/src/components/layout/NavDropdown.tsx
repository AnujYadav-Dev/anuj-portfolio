'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react';
import type { NavItemDto } from '@portfolio/shared';
import { NavIcon } from './NavIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface NavDropdownProps {
  item: NavItemDto;
  pathname: string;
  onOpenCommandPalette?: (scope?: string) => void;
}

export function NavDropdown({ item, pathname, onOpenCommandPalette }: NavDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const dropdownId = `nav-dropdown-${item.id}`;

  // Check if any child link in the entire subtree is currently active
  const isAnyChildActive = React.useMemo(() => {
    const checkActive = (nav: NavItemDto): boolean => {
      if (nav.url && nav.url !== '/' && pathname.startsWith(nav.url)) return true;
      if (nav.url === '/' && pathname === '/') return true;
      return nav.children?.some(checkActive) ?? false;
    };
    return item.children?.some(checkActive) ?? false;
  }, [item.children, pathname]);

  const isParentActive = item.url && item.url !== '/' ? pathname.startsWith(item.url) : false;
  const isActive = isParentActive || isAnyChildActive;

  // Hover intent handlers with safety debounce
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Keyboard navigation & Click-outside listener
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  // Recursively partition items into groups, standalone items, featured cards, and multiple footer strips
  const { groups, standaloneItems, featuredItems, footerItems } = React.useMemo(() => {
    const groupsList: NavItemDto[] = [];
    const standalone: NavItemDto[] = [];
    const featured: NavItemDto[] = [];
    const footers: NavItemDto[] = [];

    const traverse = (childrenList: NavItemDto[], isInsideGroup = false) => {
      for (const child of childrenList) {
        if (child.config?.isFooterBar) {
          footers.push(child);
        } else if (child.config?.isFeaturedCard) {
          featured.push(child);
        } else if (child.itemType === 'group' && !isInsideGroup) {
          const nonFooterGroupChildren: NavItemDto[] = [];
          for (const sub of child.children || []) {
            if (sub.config?.isFooterBar) {
              footers.push(sub);
            } else {
              nonFooterGroupChildren.push(sub);
            }
          }
          groupsList.push({
            ...child,
            children: nonFooterGroupChildren,
          });
        } else {
          standalone.push(child);
        }
      }
    };

    traverse(item.children || []);

    return {
      groups: groupsList,
      standaloneItems: standalone,
      featuredItems: featured,
      footerItems: footers,
    };
  }, [item.children]);

  // Determine layout mode
  const configLayout = (item.config?.layout as string | undefined) ?? '';
  const isColumnsLayout =
    configLayout === 'columns' ||
    groups.length >= 2 ||
    (configLayout !== 'stack' && groups.length > 0) ||
    (configLayout === 'columns' && standaloneItems.length > 0) ||
    (groups.length > 0 && featuredItems.length > 0);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        data-nav-id={item.id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={dropdownId}

        className={cn(
          'flex items-center gap-1.5 py-1 px-2 rounded-xs text-xs font-medium transition-colors cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-accent',
          isActive
            ? '!text-accent font-semibold'
            : '!text-muted hover:!text-foreground hover:bg-surface-muted/30',
        )}
      >
        <span>{item.label}</span>
        {item.config?.hotkey && (
          <kbd className="hidden lg:inline px-1 py-0.2 text-[9px] font-mono bg-surface-muted/60 text-muted/70 rounded-xs border border-border/50">
            {String(item.config.hotkey)}
          </kbd>
        )}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted transition-transform duration-fast shrink-0',
            isOpen && 'rotate-180 text-accent',
          )}
        />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          id={dropdownId}
          role="menu"
          aria-label={`${item.label} submenu`}
          className={cn(
            'absolute left-0 top-full pt-2 z-dropdown animate-in fade-in-0 zoom-in-95 duration-fast',
            isColumnsLayout
              ? 'min-w-[500px] lg:min-w-[600px] max-w-[700px]'
              : 'min-w-[260px] max-w-[340px]',
          )}
        >
          <div className="bg-surface/95 backdrop-blur-md border border-border rounded-lg p-3.5 shadow-2xl overflow-visible">
            {/* 1. Main Content Grid (Groups, Standalone Items, Featured Bento Cards) */}
            <div
              className={cn(
                'grid gap-5',
                isColumnsLayout
                  ? groups.length > 0 && featuredItems.length > 0
                    ? 'grid-cols-1 md:grid-cols-12'
                    : isColumnsLayout && (groups.length >= 2 || standaloneItems.length >= 2)
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1'
                  : 'grid-cols-1',
              )}
            >
              {/* Groups Column(s) */}
              {groups.length > 0 && (
                <div
                  className={cn(
                    'grid gap-5',
                    featuredItems.length > 0
                      ? 'md:col-span-8 grid-cols-1 sm:grid-cols-2'
                      : groups.length >= 2
                        ? 'grid-cols-1 sm:grid-cols-2 col-span-full'
                        : 'grid-cols-1 col-span-full',
                  )}
                >
                  {groups.map((group) => (
                    <div key={group.id} className="flex flex-col gap-1 min-w-0">
                      {/* Group Header */}
                      <div className="px-2 py-1 flex items-center justify-between border-b border-border/50 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted font-mono">
                          {group.label}
                        </span>
                      </div>

                      {/* Group Children */}
                      <div className="flex flex-col gap-1">
                        {group.children?.map((child) => (
                          <DynamicDropdownItem
                            key={child.id}
                            item={child}
                            pathname={pathname}
                            onClose={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Standalone Items List (When no groups exist) */}
              {groups.length === 0 && standaloneItems.length > 0 && (
                <div
                  className={cn(
                    isColumnsLayout && standaloneItems.length >= 2
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5 col-span-full'
                      : 'flex flex-col gap-1 col-span-full',
                  )}
                >
                  {standaloneItems.map((child) => (
                    <DynamicDropdownItem
                      key={child.id}
                      item={child}
                      pathname={pathname}
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              )}

              {/* Featured Showcase Cards (Right Column or Grid Placement) */}
              {featuredItems.length > 0 && (
                <div
                  className={cn(
                    'flex flex-col gap-2.5',
                    groups.length > 0 ? 'md:col-span-4' : 'col-span-full',
                  )}
                >
                  {featuredItems.map((child) => (
                    <BentoShowcaseCard
                      key={child.id}
                      item={child}
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 2. Standalone Items Below Groups (if both groups AND extra standalone items exist) */}
            {groups.length > 0 && standaloneItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <div
                  className={cn(
                    isColumnsLayout && standaloneItems.length >= 2
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-2'
                      : 'flex flex-col gap-1',
                  )}
                >
                  {standaloneItems.map((child) => (
                    <DynamicDropdownItem
                      key={child.id}
                      item={child}
                      pathname={pathname}
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Full-Width Footer Strip Area (Supports Single Banner or Multiple Action Items) */}
            {footerItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/80">
                {footerItems.length === 1 ? (
                  /* Single Full-Width Footer Banner */
                  <FooterStripItem item={footerItems[0]} pathname={pathname} onClose={() => setIsOpen(false)} />
                ) : (
                  /* Multiple Footer Strip Actions Toolbar */
                  <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-sm bg-surface-muted/50 border border-border/60">
                    {footerItems.map((footerItem) => (
                      <FooterStripItem
                        key={footerItem.id}
                        item={footerItem}
                        pathname={pathname}
                        onClose={() => setIsOpen(false)}
                        isCompact
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Command Palette Pre-scoping Action Strip */}
            {item.config?.commandPaletteScope && onOpenCommandPalette && (
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between px-2 text-[10px] text-muted">
                <span>Quick search in this section</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCommandPalette(String(item.config?.commandPaletteScope));
                  }}
                  className="flex items-center gap-1 text-accent hover:underline font-mono cursor-pointer"
                >
                  <span>Search</span>
                  <kbd className="px-1 py-0.2 bg-surface-muted border border-border rounded-xs">⌘ K</kbd>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Individual Footer Strip Item (Link, Button, or Dropdown in Footer Strip) */
function FooterStripItem({
  item,
  pathname,
  onClose,
  isCompact = false,
}: {
  item: NavItemDto;
  pathname: string;
  onClose: () => void;
  isCompact?: boolean;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isDropdown = item.itemType === 'dropdown' || hasChildren;

  // Dropdown inside Footer Strip
  if (isDropdown) {
    return <CascadingFlyoutSubmenu item={item} pathname={pathname} onClose={onClose} />;
  }

  // Button inside Footer Strip
  if (item.itemType === 'button') {
    const variant = (item.config?.buttonVariant as 'primary' | 'secondary' | 'outline' | 'ghost') || 'primary';
    return (
      <Link
        href={item.url || '#'}
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
        onClick={onClose}
        className={cn(isCompact ? 'inline-block' : 'w-full')}
      >
        <Button variant={variant} size="sm" className={cn('text-xs', !isCompact && 'w-full')}>
          {item.icon && <NavIcon name={item.icon} className="w-3.5 h-3.5 mr-1.5" />}
          <span>{item.label}</span>
          {item.badge && <Badge variant="outline" size="sm" className="ml-1.5">{item.badge}</Badge>}
        </Button>
      </Link>
    );
  }

  // Standard Footer Action Link
  return (
    <Link
      href={item.url || '#'}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className={cn(
        'flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-sm transition-colors group',
        isCompact
          ? 'hover:bg-surface-muted text-xs font-medium !text-muted hover:!text-accent'
          : 'bg-surface-muted/50 hover:bg-surface-muted border border-border/60 text-xs font-medium !text-muted hover:!text-accent w-full',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <NavIcon name={item.icon || 'layers'} className="w-3.5 h-3.5 text-accent shrink-0" />
        <span className="!text-foreground group-hover:!text-accent transition-colors font-medium truncate">
          {item.label}
        </span>
        {item.badge && (
          <Badge variant="outline" size="sm">
            {item.badge}
          </Badge>
        )}
      </div>
      {item.isExternal ? (
        <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0" />
      ) : (
        <span className="text-muted group-hover:text-accent font-mono text-[11px] shrink-0">→</span>
      )}
    </Link>
  );
}

/** Dynamic Item Dispatcher: Handles nested flyout submenus, buttons, dividers, bento cards, and links */
function DynamicDropdownItem({
  item,
  pathname,
  onClose,
}: {
  item: NavItemDto;
  pathname: string;
  onClose: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isNestedDropdown = item.itemType === 'dropdown' || (hasChildren && item.itemType !== 'group');

  // Divider
  if (item.itemType === 'divider') {
    return <hr className="border-t border-border/60 my-1" />;
  }

  // Nested Flyout Submenu (Cascading Dropdown)
  if (isNestedDropdown) {
    return <CascadingFlyoutSubmenu item={item} pathname={pathname} onClose={onClose} />;
  }

  // Standalone Button Inside Dropdown / Group
  if (item.itemType === 'button') {
    const variant = (item.config?.buttonVariant as 'primary' | 'secondary' | 'outline' | 'ghost') || 'primary';
    return (
      <div className="py-1 px-1">
        <Link
          href={item.url || '#'}
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          onClick={onClose}
          className="w-full block"
        >
          <Button variant={variant} size="sm" className="w-full text-xs justify-between">
            <span className="flex items-center gap-1.5">
              {item.icon && <NavIcon name={item.icon} className="w-3.5 h-3.5" />}
              <span>{item.label}</span>
            </span>
            {item.badge && <Badge variant="outline" size="sm">{item.badge}</Badge>}
          </Button>
        </Link>
      </div>
    );
  }

  // Featured Bento Card
  if (item.config?.isFeaturedCard) {
    return <BentoShowcaseCard item={item} onClose={onClose} />;
  }

  // Standard Rich Navigation Card
  const isItemActive =
    item.url && item.url !== '/' ? pathname.startsWith(item.url) : pathname === item.url;

  return (
    <Link
      href={item.url || '#'}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      role="menuitem"
      className={cn(
        'group flex items-start gap-2.5 p-2 rounded-md transition-colors select-none',
        isItemActive
          ? 'bg-surface-muted !text-accent font-medium'
          : 'hover:bg-surface-muted/60 !text-muted hover:!text-foreground',
      )}
    >
      {item.icon && (
        <div className="p-1 rounded-xs bg-surface-muted/80 border border-border/60 text-accent group-hover:border-accent/40 shrink-0 mt-0.5 transition-colors">
          <NavIcon name={item.icon} className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'text-xs font-medium transition-colors',
              isItemActive ? '!text-accent font-semibold' : '!text-foreground group-hover:!text-accent',
            )}
          >
            {item.label}
          </span>
          {item.badge && (
            <Badge variant="outline" size="sm">
              {item.badge}
            </Badge>
          )}
          {item.config?.hotkey && (
            <kbd className="px-1 py-0.2 text-[9px] font-mono bg-surface-muted text-muted rounded-xs border border-border/60">
              {String(item.config.hotkey)}
            </kbd>
          )}
          {item.isExternal && (
            <ArrowUpRight className="w-3 h-3 text-muted/60 group-hover:text-accent transition-transform shrink-0" />
          )}
        </div>

        {item.description && (
          <p className="text-[11px] text-muted line-clamp-2 leading-tight mt-0.5">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
}

/** Cascading Submenu (Flyout Panel Expanding to the Right) */
function CascadingFlyoutSubmenu({
  item,
  pathname,
  onClose,
}: {
  item: NavItemDto;
  pathname: string;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const flyoutRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const isSubActive =
    item.url && item.url !== '/' ? pathname.startsWith(item.url) : pathname === item.url;

  return (
    <div
      ref={flyoutRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          'w-full group flex items-center justify-between gap-2 p-2 rounded-md transition-colors cursor-pointer select-none text-left',
          isOpen || isSubActive
            ? 'bg-surface-muted !text-accent font-medium'
            : 'hover:bg-surface-muted/60 !text-muted hover:!text-foreground',
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {item.icon && (
            <div className="p-1 rounded-xs bg-surface-muted/80 border border-border/60 text-accent group-hover:border-accent/40 shrink-0 transition-colors">
              <NavIcon name={item.icon} className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium !text-foreground group-hover:!text-accent transition-colors truncate">
                {item.label}
              </span>
              {item.badge && (
                <Badge variant="outline" size="sm">
                  {item.badge}
                </Badge>
              )}
              {item.config?.hotkey && (
                <kbd className="px-1 py-0.2 text-[9px] font-mono bg-surface-muted text-muted rounded-xs border border-border/60">
                  {String(item.config.hotkey)}
                </kbd>
              )}
            </div>
            {item.description && (
              <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{item.description}</p>
            )}
          </div>
        </div>

        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 text-muted transition-transform shrink-0',
            isOpen && 'translate-x-0.5 text-accent',
          )}
        />
      </button>

      {/* Flyout Sub-panel to the right */}
      {isOpen && item.children && item.children.length > 0 && (
        <div
          role="menu"
          aria-label={`${item.label} flyout`}
          className="absolute left-full top-0 pl-1.5 z-tooltip min-w-[220px] max-w-[300px] animate-in fade-in-0 zoom-in-95 duration-fast"
        >
          <div className="bg-surface/98 backdrop-blur-md border border-border rounded-lg p-2 shadow-2xl flex flex-col gap-1">
            {item.children.map((child) => (
              <DynamicDropdownItem
                key={child.id}
                item={child}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Featured Bento Showcase Card */
function BentoShowcaseCard({
  item,
  onClose,
}: {
  item: NavItemDto;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.url || '#'}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      role="menuitem"
      className="group relative block p-3 rounded-md bg-surface-muted/60 hover:bg-surface-muted border border-border hover:border-accent/50 transition-all duration-fast select-none !text-foreground h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <NavIcon name={item.icon || 'sparkles'} className="w-4 h-4 text-accent shrink-0" />
            <span className="text-xs font-bold !text-foreground group-hover:!text-accent transition-colors">
              {item.label}
            </span>
          </div>
          {item.badge && (
            <Badge variant="accent" size="sm">
              {item.badge}
            </Badge>
          )}
        </div>

        {item.description && (
          <p className="text-[11px] text-muted leading-relaxed line-clamp-3 mt-1">
            {item.description}
          </p>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-accent font-semibold">
        <span>Explore details</span>
        <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
