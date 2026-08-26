'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, ArrowUpRight, Download } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavIcon } from './NavIcon';
import { useNavItems } from '@/hooks/useLayout';
import { useSocialLinks, useActiveResume } from '@/hooks/useProfile';
import type { NavItemDto } from '@portfolio/shared';
import { cn } from '@/lib/cn';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { data: navData } = useNavItems('header');
  const { data: socialData } = useSocialLinks();
  const { data: resumeData } = useActiveResume();

  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>({});

  const toggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

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
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = navData?.data ?? [];

  return (
    <div
      id="mobile-nav-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-modal md:hidden flex justify-end animate-in fade-in-0 duration-fast"
    >

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs bg-surface border-l border-border h-full flex flex-col p-5 shadow-2xl z-10 animate-in slide-in-from-right duration-fast">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <span className="font-mono font-extrabold text-sm text-foreground">
            ANUJ<span className="text-accent">.V</span>
          </span>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-sm text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Navigation Elements */}
        <nav className="flex flex-col gap-1 py-4 overflow-y-auto flex-1">
          {items.map((item) => (
            <MobileNavTreeItem
              key={item.id}
              item={item}
              pathname={pathname}
              onClose={onClose}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              depth={0}
            />
          ))}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto pt-3.5 border-t border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-mono">Theme</span>
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
                className="w-full text-xs"
                rightIcon={<Download className="h-3.5 w-3.5" />}
              >
                Download Resume
              </Button>
            </a>
          ) : (
            <Link href="/resume" onClick={onClose} className="w-full">
              <Button variant="secondary" size="sm" className="w-full text-xs">
                View Resume
              </Button>
            </Link>
          )}

          {/* Social icons */}
          {socialData?.data && socialData.data.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
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

/** Recursive Mobile Navigation Tree Node (Supports arbitrary depth & all item roles) */
function MobileNavTreeItem({
  item,
  pathname,
  onClose,
  expandedIds,
  toggleExpand,
  depth,
}: {
  item: NavItemDto;
  pathname: string;
  onClose: () => void;
  expandedIds: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  depth: number;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = Boolean(expandedIds[item.id]);
  const isSelfActive =
    item.url === '/' ? pathname === '/' : item.url && pathname.startsWith(item.url);

  // 1. Divider
  if (item.itemType === 'divider') {
    return <hr className="border-t border-border/50 my-1.5" />;
  }

  // 2. Full-Width Footer Strip representation
  if (item.config?.isFooterBar) {
    return (
      <Link
        href={item.url || '#'}
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
        onClick={onClose}
        className="flex items-center justify-between px-2.5 py-2 rounded-sm bg-surface-muted/60 hover:bg-surface-muted border border-border/60 text-xs font-medium !text-muted hover:!text-accent transition-colors my-1"
      >
        <div className="flex items-center gap-2">
          <NavIcon name={item.icon || 'layers'} className="w-3.5 h-3.5 text-accent" />
          <span className="!text-foreground font-medium">{item.label}</span>
          {item.badge && (
            <Badge variant="outline" size="sm">
              {item.badge}
            </Badge>
          )}
        </div>
        {item.isExternal ? (
          <ArrowUpRight className="w-3 h-3 text-muted" />
        ) : (
          <span className="text-muted font-mono text-[11px]">→</span>
        )}
      </Link>
    );
  }

  // 3. Featured Bento Card representation
  if (item.config?.isFeaturedCard) {
    return (
      <Link
        href={item.url || '#'}
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
        onClick={onClose}
        className="flex flex-col p-2.5 rounded-sm bg-surface-muted/60 hover:bg-surface-muted border border-border hover:border-accent/40 transition-colors my-1"
      >
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <NavIcon name={item.icon || 'sparkles'} className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-xs font-bold !text-foreground">{item.label}</span>
          </div>
          {item.badge && (
            <Badge variant="accent" size="sm">
              {item.badge}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-[10px] text-muted leading-tight mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </Link>
    );
  }

  // 4. Group Container (Header + Children)
  if (item.itemType === 'group') {
    return (
      <div className="pt-2 first:pt-0">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted font-mono px-2 block mb-1">
          {item.label}
        </span>
        <div className="flex flex-col gap-1 pl-1">
          {item.children?.map((subChild) => (
            <MobileNavTreeItem
              key={subChild.id}
              item={subChild}
              pathname={pathname}
              onClose={onClose}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // 5. Accordion Parent (Node with Children at any depth)
  if (hasChildren) {
    return (
      <div className="flex flex-col rounded-sm overflow-hidden">
        <div
          className={cn(
            'flex items-center justify-between py-2 px-2.5 rounded-sm text-xs font-medium transition-colors select-none',
            isSelfActive
              ? 'bg-surface-muted !text-accent font-semibold'
              : '!text-foreground hover:bg-surface-muted/50',
          )}
        >
          <Link
            href={item.url || '#'}
            onClick={(e) => {
              if (!item.url || item.url === '#') {
                e.preventDefault();
                toggleExpand(item.id);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {item.icon && <NavIcon name={item.icon} className="w-3.5 h-3.5 text-accent shrink-0" />}
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="accent" size="sm">
                {item.badge}
              </Badge>
            )}
          </Link>

          <button
            type="button"
            onClick={() => toggleExpand(item.id)}
            aria-expanded={isExpanded}
            className="p-1 text-muted hover:text-foreground cursor-pointer shrink-0"
          >
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-fast',
                isExpanded && 'rotate-180 text-accent',
              )}
            />
          </button>
        </div>

        {/* Expanded Recursive Sub-Tree */}
        {isExpanded && (
          <div className="pl-3 py-1 flex flex-col gap-1 border-l-2 border-border/80 ml-3 my-1">
            {item.children.map((child) => (
              <MobileNavTreeItem
                key={child.id}
                item={child}
                pathname={pathname}
                onClose={onClose}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6. Direct Leaf Item (Link or Simple Button)
  return (
    <Link
      href={item.url || '#'}
      target={item.isExternal ? '_blank' : undefined}
      rel={item.isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className={cn(
        'flex flex-col py-1.5 px-2.5 rounded-xs transition-colors select-none',
        isSelfActive
          ? 'bg-surface-muted/90 !text-accent font-semibold'
          : '!text-muted hover:!text-foreground hover:bg-surface-muted/40',
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {item.icon && <NavIcon name={item.icon} className="w-3.5 h-3.5 text-accent shrink-0" />}
          <span className="text-xs font-medium truncate !text-foreground">{item.label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.badge && (
            <Badge variant="outline" size="sm">
              {item.badge}
            </Badge>
          )}
          {item.isExternal && <ArrowUpRight className="w-3 h-3 text-muted" />}
        </div>
      </div>

      {item.description && (
        <p className="text-[10px] text-muted/70 line-clamp-1 mt-0.5 pl-5.5">{item.description}</p>
      )}
    </Link>
  );
}
