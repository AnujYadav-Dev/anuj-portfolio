'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  FileText,
  Briefcase,
  BookOpen,
  User,
  Clock,
  Sun,
  Moon,
  Mail,
  Download,
  X,
  Code,
} from 'lucide-react';

import { useSearch } from '@/hooks/useDiscovery';
import { useActiveResume } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useLayout';
import { parseCommandQuery } from '@/lib/command-parser';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function CommandPalette({ isOpen, onClose, initialQuery = '' }: CommandPaletteProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = React.useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Pure registry-driven query & scope resolution
  const { cleanSearchTerm, searchType, scopeBadge } = React.useMemo(
    () => parseCommandQuery(query),
    [query],
  );

  const { data: searchResults, isLoading } = useSearch({
    q: cleanSearchTerm,
    type: searchType,
    limit: 10,
  });

  const { data: resumeData } = useActiveResume();
  const { data: settingsData } = useSiteSettings();

  const primaryEmail = settingsData?.data?.['author.email'] || 'anujyadav9449@gmail.com';

  const defaultActions: Array<{
    id: string;
    title: string;
    category: string;
    icon: React.ReactNode;
    action: () => void;
    meta?: string;
  }> = React.useMemo(
    () => [
      {
        id: 'nav-works',
        title: 'Explore Works & Projects',
        category: 'Navigation',
        icon: <Briefcase className="h-4 w-4" />,
        action: () => router.push('/works'),
      },
      {
        id: 'nav-blogs',
        title: 'Read Blog Articles',
        category: 'Navigation',
        icon: <BookOpen className="h-4 w-4" />,
        action: () => router.push('/blogs'),
      },
      {
        id: 'nav-about',
        title: 'About Me & Journey',
        category: 'Navigation',
        icon: <User className="h-4 w-4" />,
        action: () => router.push('/about'),
      },
      {
        id: 'nav-timeline',
        title: 'Interactive Career Timeline',
        category: 'Navigation',
        icon: <Clock className="h-4 w-4" />,
        action: () => router.push('/my-timeline'),
      },
      {
        id: 'nav-skills',
        title: 'Technical Skills Matrix',
        category: 'Navigation',
        icon: <Code className="h-4 w-4" />,
        action: () => router.push('/skills'),
      },
      {
        id: 'nav-contact',
        title: 'Get in Touch / Contact Form',
        category: 'Navigation',
        icon: <Mail className="h-4 w-4" />,
        action: () => router.push('/contact'),
      },
      {
        id: 'action-theme',
        title: `Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
        category: 'Actions',
        icon: resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        action: () => {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          toast.success(`Switched to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`);
        },
      },
      {
        id: 'action-email',
        title: `Copy Email Address (${primaryEmail})`,
        category: 'Actions',
        icon: <Mail className="h-4 w-4" />,
        action: async () => {
          await navigator.clipboard.writeText(primaryEmail);
          toast.success('Email copied to clipboard');
        },
      },
      {
        id: 'action-resume',
        title: 'Download Active Resume (PDF)',
        category: 'Actions',
        icon: <Download className="h-4 w-4" />,
        action: () => {
          if (resumeData?.data?.fileUrl) {
            window.open(resumeData.data.fileUrl, '_blank');
          } else {
            router.push('/resume');
          }
        },
      },
    ],
    [router, resolvedTheme, setTheme, primaryEmail, resumeData],
  );

  const displayedItems = React.useMemo(() => {
    // If no active query and no scoped search, show default actions
    if (!cleanSearchTerm && searchType === 'all' && !scopeBadge) return defaultActions;

    const results: Array<{
      id: string;
      title: string;
      category: string;
      icon: React.ReactNode;
      action: () => void;
      meta?: string;
    }> = [];

    if (searchResults?.data?.results && searchResults.data.results.length > 0) {
      for (const item of searchResults.data.results) {
        const path = item.url;
        let icon = <FileText className="h-4 w-4" />;

        if (item.type === 'project') icon = <Briefcase className="h-4 w-4" />;
        else if (item.type === 'blog_post') icon = <BookOpen className="h-4 w-4" />;
        else if (item.type === 'research_paper') icon = <FileText className="h-4 w-4" />;
        else if (item.type === 'skill') icon = <Code className="h-4 w-4" />;

        results.push({
          id: `${item.type}-${item.id}`,
          title: item.title,
          category: item.type.toUpperCase(),
          icon,
          meta: item.snippet || undefined,
          action: () => router.push(path),
        });
      }
    }

    if (results.length > 0) {
      return results;
    }

    // If API returned 0 results, check if any default actions match cleanSearchTerm
    if (cleanSearchTerm) {
      const matchingActions = defaultActions.filter((a) =>
        a.title.toLowerCase().includes(cleanSearchTerm.toLowerCase()),
      );
      if (matchingActions.length > 0) return matchingActions;
    }

    return [];
  }, [cleanSearchTerm, searchType, scopeBadge, defaultActions, searchResults, router]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [displayedItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayedItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayedItems.length) % (displayedItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = displayedItems[selectedIndex];
      if (current) {
        current.action();
        onClose();
      }
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent
        showClose={false}
        className="max-w-2xl p-0 overflow-hidden border-border bg-surface shadow-2xl"
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-label="Search portfolio content or trigger commands"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (projects, blogs, skills, actions)..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-placeholder focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search input"
              className="text-muted hover:text-foreground p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="cursor-pointer focus:outline-none"
          >
            <Badge variant="outline" size="sm" className="hover:bg-surface-muted transition-colors">
              ESC
            </Badge>
          </button>
        </div>

        {/* Results / Action list */}
        <div
          id="command-palette-results"
          role="listbox"
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/30"
        >
          {displayedItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              {isLoading ? 'Searching...' : `No results found for "${cleanSearchTerm || query}"`}
            </div>
          ) : (
            displayedItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer transition-colors text-xs select-none',
                    isSelected
                      ? 'bg-surface-muted text-accent font-semibold'
                      : 'text-foreground hover:bg-surface-muted/50',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn('shrink-0', isSelected ? 'text-accent' : 'text-muted')}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{item.title}</span>
                      {item.meta && (
                        <span className="text-[11px] text-muted truncate font-normal">
                          {item.meta}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={isSelected ? 'accent' : 'outline'} size="sm">
                    {item.category}
                  </Badge>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-muted/50 text-[11px] text-muted font-mono select-none">
          <div className="flex items-center gap-2">
            <span>
              Navigate{' '}
              <kbd className="px-1 bg-surface border border-border rounded-xs text-[10px]">↑</kbd>{' '}
              <kbd className="px-1 bg-surface border border-border rounded-xs text-[10px]">↓</kbd>
            </span>
            <span>
              Select{' '}
              <kbd className="px-1 bg-surface border border-border rounded-xs text-[10px]">↵</kbd>
            </span>
          </div>
          <span>Command Palette</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
