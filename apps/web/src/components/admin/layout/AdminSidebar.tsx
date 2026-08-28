'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  FolderGit2,
  FileText,
  GraduationCap,
  Layers,
  Component,
  User,
  Info,
  Wrench,
  Briefcase,
  BookOpen,
  Milestone,
  Award,
  Trophy,
  FileCode,
  Tag,
  Share2,
  GitPullRequest,
  Quote,
  Image as ImageIcon,
  SlidersHorizontal,
  Menu as MenuIcon,
  Settings,
  Globe,
  Mail,
  HardDrive,
  Inbox,
  MessageSquare,
  Send,
  Compass,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Core',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Visitor Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Projects & Works', href: '/admin/works', icon: FolderGit2 },
      { label: 'Blog Posts', href: '/admin/blogs', icon: FileText },
      { label: 'Research Papers', href: '/admin/research', icon: GraduationCap },
      { label: 'Dynamic Pages', href: '/admin/pages', icon: Layers },
      { label: 'Content Blocks', href: '/admin/blocks', icon: Component },
    ],
  },
  {
    title: 'Profile & Journey',
    items: [
      { label: 'Author Profile', href: '/admin/profile', icon: User },
      { label: 'About Sections', href: '/admin/about', icon: Info },
      { label: 'Skills Matrix', href: '/admin/skills', icon: Wrench },
      { label: 'Experience', href: '/admin/experience', icon: Briefcase },
      { label: 'Education', href: '/admin/education', icon: BookOpen },
      { label: 'Journey Timeline', href: '/admin/timeline', icon: Milestone },
      { label: 'Certificates', href: '/admin/certificates', icon: Award },
      { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
      { label: 'Resumes', href: '/admin/resume', icon: FileCode },
      { label: 'Tags Taxonomy', href: '/admin/tags', icon: Tag },
      { label: 'Social Links', href: '/admin/social', icon: Share2 },
      { label: 'Open Source', href: '/admin/opensource', icon: GitPullRequest },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
      { label: 'Media Gallery', href: '/admin/gallery', icon: ImageIcon },
    ],
  },
  {
    title: 'Site Customizer',
    items: [
      { label: 'Homepage Builder', href: '/admin/homepage', icon: SlidersHorizontal },
      { label: 'Navigation Menus', href: '/admin/navigation', icon: MenuIcon },
      { label: 'Routes Directory', href: '/admin/routes', icon: Compass },
      { label: 'Site Settings', href: '/admin/settings', icon: Settings },
      { label: 'SEO Defaults', href: '/admin/seo', icon: Globe },
      { label: 'Email Templates', href: '/admin/emails', icon: Mail },
    ],
  },
  {
    title: 'Assets & Inbox',
    items: [
      { label: 'Media Library', href: '/admin/media', icon: HardDrive },
      { label: 'Contact Messages', href: '/admin/contact', icon: Inbox },
      { label: 'Guestbook Queue', href: '/admin/guestbook', icon: MessageSquare },
      { label: 'Newsletter', href: '/admin/newsletter', icon: Send },
    ],
  },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'relative bg-background border-r border-border flex flex-col transition-all duration-300 z-30 shrink-0 select-none h-screen sticky top-0',
        isCollapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between shrink-0">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-lg text-foreground">
              ANUJ<span className="text-accent">.V</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-surface-muted text-accent rounded border border-border">
              CMS
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/admin" className="mx-auto font-extrabold text-base text-accent">
            AV
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-muted hover:text-foreground hover:bg-surface-muted rounded-md transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-mono uppercase tracking-wider text-placeholder font-semibold">
                {group.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group',
                      active
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-muted hover:text-foreground hover:bg-surface-muted',
                      isCollapsed && 'justify-center px-2',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        active ? 'text-accent' : 'text-muted group-hover:text-foreground',
                      )}
                    />
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Quick Links */}
      <div className="p-3 border-t border-border shrink-0">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-accent hover:bg-surface-muted rounded-md transition-colors group',
            isCollapsed && 'justify-center px-2',
          )}
          title="View Live Public Site"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-muted group-hover:text-accent" />
          {!isCollapsed && <span className="font-mono truncate">Live Portfolio ↗</span>}
        </Link>
      </div>
    </aside>
  );
}
