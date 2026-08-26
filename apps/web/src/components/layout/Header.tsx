'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, ArrowUpRight } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { MobileNav } from './MobileNav';
import { NavDropdown } from './NavDropdown';
import { SplitNavButton } from './SplitNavButton';
import { NavIcon } from './NavIcon';
import { useNavItems } from '@/hooks/useLayout';

import { createScopedQueryString } from '@/lib/command-parser';
import { type NavItemDto } from '@portfolio/shared';

import { cn } from '@/lib/cn';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [commandInitialQuery, setCommandInitialQuery] = React.useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const { data: navData } = useNavItems('header');
  const items = React.useMemo<NavItemDto[]>(() => navData?.data ?? [], [navData?.data]);

  // Command palette keyboard shortcut listener (Ctrl+K or Cmd+K) & Developer hotkey handler
  React.useEffect(() => {
    const findItemByHotkey = (list: NavItemDto[], key: string): NavItemDto | undefined => {
      for (const it of list) {
        if (it.isEnabled && it.config?.hotkey && String(it.config.hotkey).toUpperCase() === key) {
          return it;
        }
        if (it.children && it.children.length > 0) {
          const found = findItemByHotkey(it.children, key);
          if (found) return found;
        }
      }
      return undefined;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Command Palette Shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandInitialQuery('');
        setIsCommandOpen((prev) => !prev);
        return;
      }

      // 2. Direct Hotkey navigation for navigation items with hotkeys configured (any depth)
      if (!isCommandOpen && !e.ctrlKey && !e.metaKey && !e.altKey && e.key) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }

        const pressedKey = e.key.toUpperCase();
        const matchedItem = findItemByHotkey(items, pressedKey);

        if (matchedItem) {
          // If it's a dropdown or an item without a navigation URL, toggle/focus its trigger button
          if (
            matchedItem.itemType === 'dropdown' ||
            !matchedItem.url ||
            matchedItem.url === '#' ||
            matchedItem.url === ''
          ) {
            e.preventDefault();
            const triggerEl = document.querySelector(
              `[data-nav-id="${matchedItem.id}"]`,
            ) as HTMLElement | null;
            if (triggerEl) {
              triggerEl.click();
              triggerEl.focus();
            }
          } else if (matchedItem.url && matchedItem.url !== '#') {
            e.preventDefault();
            if (matchedItem.isExternal) {
              window.open(matchedItem.url, '_blank', 'noopener,noreferrer');
            } else {
              router.push(matchedItem.url);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, items, router]);

  const handleOpenScopedSearch = (scope?: string) => {
    setCommandInitialQuery(createScopedQueryString(scope));
    setIsCommandOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-sticky w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-fast">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand Wordmark Logo */}
          <Link
            href="/"
            className="font-mono font-extrabold text-sm tracking-tight text-foreground hover:text-accent transition-colors select-none shrink-0"
          >
            ANUJ<span className="text-accent">.V</span>
          </Link>

          {/* Desktop Navigation Elements */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-2 lg:gap-3 text-xs font-medium"
          >
            {items.map((item) => {
              // 1. Dropdown Item
              if (
                item.itemType === 'dropdown' ||
                (item.children && item.children.length > 0 && item.itemType !== 'button')
              ) {
                return (
                  <NavDropdown
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    onOpenCommandPalette={handleOpenScopedSearch}
                  />
                );
              }

              // 2. Button / Split Action CTA
              if (item.itemType === 'button') {
                return <SplitNavButton key={item.id} item={item} pathname={pathname} />;
              }

              // 3. Standard Navigation Link
              const isActive = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url);

              return (
                <Link
                  key={item.id}
                  href={item.url || '#'}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 py-1 px-2 rounded-xs transition-colors hover:!text-accent select-none',
                    isActive
                      ? '!text-accent font-semibold'
                      : '!text-muted hover:!text-foreground hover:bg-surface-muted/30',
                  )}
                >
                  {item.icon && <NavIcon name={item.icon} className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                  {item.config?.hotkey && (
                    <kbd className="hidden lg:inline px-1 py-0.2 text-[9px] font-mono bg-surface-muted/60 text-muted/70 rounded-xs border border-border/50">
                      {String(item.config.hotkey)}
                    </kbd>
                  )}
                  {item.isExternal && <ArrowUpRight className="w-3 h-3 text-muted" />}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => {
                setCommandInitialQuery('');
                setIsCommandOpen(true);
              }}
              className="flex items-center gap-2 h-8 px-2.5 rounded-sm border border-border bg-surface hover:bg-surface-muted hover:border-muted text-muted hover:text-foreground text-xs font-mono transition-colors cursor-pointer select-none"
              aria-label="Open Command Palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] bg-surface-muted border border-border/80 rounded-xs text-placeholder">
                ⌘ K
              </kbd>
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav-drawer"
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-sm border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        initialQuery={commandInitialQuery}
      />

      {/* Mobile Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
}
