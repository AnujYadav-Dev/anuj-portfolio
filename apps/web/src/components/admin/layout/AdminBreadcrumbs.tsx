'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAME_MAP: Record<string, string> = {
  admin: 'Dashboard',
  works: 'Projects & Works',
  blogs: 'Blog Posts',
  research: 'Research Papers',
  pages: 'Dynamic Pages',
  blocks: 'Content Blocks',
  profile: 'Author Profile',
  about: 'About Sections',
  skills: 'Skills & Categories',
  experience: 'Work Experience',
  education: 'Education',
  timeline: 'Journey Timeline',
  certificates: 'Certifications',
  achievements: 'Achievements',
  resume: 'Resumes',
  tags: 'Taxonomy & Tags',
  social: 'Social Links',
  opensource: 'Open Source',
  testimonials: 'Testimonials',
  gallery: 'Media Gallery',
  homepage: 'Homepage Builder',
  navigation: 'Navigation Menus',
  settings: 'Site Settings',
  seo: 'Global SEO Defaults',
  emails: 'Email Templates',
  media: 'Media Library',
  contact: 'Contact Inbox',
  guestbook: 'Guestbook Queue',
  newsletter: 'Newsletter Subscribers',
  analytics: 'Visitor Analytics',
  new: 'Create New',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Home className="w-3.5 h-3.5 text-accent" />
        <span>Dashboard</span>
      </div>
    );
  }

  const items = segments.map((seg, idx) => {
    const href = `/${segments.slice(0, idx + 1).join('/')}`;
    const name = ROUTE_NAME_MAP[seg] || seg;
    const isLast = idx === segments.length - 1;

    return { name, href, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-muted hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.slice(1).map((item, idx) => (
        <React.Fragment key={`${item.href}-${idx}`}>
          <ChevronRight className="w-3 h-3 text-placeholder" />

          {item.isLast ? (
            <span className="font-semibold text-foreground truncate max-w-[200px]">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted hover:text-foreground transition-colors truncate max-w-[150px]"
            >
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
