'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tooltip } from '@/components/ui/tooltip';
import { CommandPalette } from './CommandPalette';
import { MobileNav } from './MobileNav';
import { useNavItems } from '@/hooks/useLayout';
import { cn } from '@/lib/cn';

export function Header() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const { data: navData } = useNavItems('header');

  // Command palette keyboard shortcut listener (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const defaultNavLinks = [
    { label: 'Works ^', href: '/works' },
    { label: 'Writings ^', href: '/blogs' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
    { label: 'Timeline', href: '/my-timeline' },
    { label: 'Contact', href: '/contact' },
  ];

  const navLinks =
    navData?.data && navData.data.length > 0
      ? navData.data.map((item) => ({ label: item.label, href: item.url }))
      : defaultNavLinks;

  return (
    <>
      <header className="sticky top-0 z-sticky backdrop-blur-md bg-background/80 border-b border-border transition-colors duration-fast">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Brand Watermark Logo */}
          <Link
            href="/"
            className="font-mono font-extrabold text-sm tracking-tight text-foreground hover:text-accent transition-colors select-none"
          >
            ANUJ<span className="text-accent">.Y</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors py-1 hover:text-accent',
                    isActive
                      ? 'text-accent font-semibold'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-sm border border-border bg-surface hover:bg-surface-muted hover:border-muted text-muted hover:text-foreground text-xs font-mono transition-colors cursor-pointer select-none"
              aria-label="Open Command Palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] bg-surface-muted border border-border/80 rounded-xs text-placeholder">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-sm border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
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
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}
