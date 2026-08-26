'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Download } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useNavItems } from '@/hooks/useLayout';
import { useSocialLinks, useActiveResume } from '@/hooks/useProfile';
import { cn } from '@/lib/cn';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { data: navData } = useNavItems('header');
  const { data: socialData } = useSocialLinks();
  const { data: resumeData } = useActiveResume();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const defaultNavLinks = [
    { label: 'Works', href: '/works' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
    { label: 'Timeline', href: '/my-timeline' },
    { label: 'Skills', href: '/skills' },
    { label: 'Contact', href: '/contact' },
    { label: 'Guestbook', href: '/guestbook' },
  ];

  const links =
    navData?.data && navData.data.length > 0
      ? navData.data.map((item) => ({ id: item.id, label: item.label, href: item.url }))
      : defaultNavLinks.map((item, idx) => ({ id: `default-${idx}`, ...item }));

  if (!isOpen) return null;

  return (
    <div
      id="mobile-nav-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-modal flex md:hidden"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-modal ml-auto flex h-full w-[280px] flex-col bg-surface border-l border-border p-6 shadow-2xl animate-in slide-in-from-right duration-fast">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="font-mono font-extrabold text-sm text-foreground">
            ANUJ<span className="text-accent">.DEV</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-xs text-muted hover:text-foreground cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1 py-6 overflow-y-auto">
          {links.map((link, idx) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            return (
              <Link
                key={link.id || `${link.href}-${idx}`}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between py-2.5 px-3 rounded-sm text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-muted text-accent font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted/50',
                )}
              >
                <span>{link.label}</span>
                {isActive && (
                  <Badge variant="accent" size="sm">
                    ACTIVE
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto pt-4 border-t border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Theme</span>
            <ThemeToggle />
          </div>

          {resumeData?.data?.fileUrl ? (
            <a
              href={resumeData.data.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                rightIcon={<Download className="h-3.5 w-3.5" />}
              >
                Download Resume
              </Button>
            </a>
          ) : (
            <Link href="/resume" onClick={onClose} className="w-full">
              <Button variant="secondary" size="sm" className="w-full">
                View Resume
              </Button>
            </Link>
          )}

          {/* Social icons */}
          {socialData?.data && socialData.data.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {socialData.data.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-accent underline-offset-4 hover:underline"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
