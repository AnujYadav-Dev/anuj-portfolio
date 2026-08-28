'use client';

import * as React from 'react';
import { useNavItems, useSiteSettings } from '@/hooks/useLayout';
import { useSocialLinks } from '@/hooks/useProfile';
import { FooterBrand } from './FooterBrand';
import { FooterColumn } from './FooterColumn';
import { FooterDeveloperHub } from './FooterDeveloperHub';
import { FooterThemeControl } from './FooterThemeControl';
import { FooterNameBanner } from './FooterNameBanner';
import { FooterNewsletter } from './FooterNewsletter';
import type { NavItemDto, SocialLinkDto } from '@portfolio/shared';
import { NavLocation, NavItemType } from '@portfolio/shared';

const DEFAULT_FOOTER_COLUMNS: NavItemDto[] = [
  {
    id: 'default-works',
    label: 'Works',
    url: '/works',
    location: NavLocation.Footer,
    itemType: NavItemType.Group,
    description: null,
    icon: null,
    badge: null,
    config: {},
    isExternal: false,
    sortOrder: 0,
    isEnabled: true,
    parentId: null,
    children: [
      {
        id: 'def-w1',
        label: 'Engineering Case Studies',
        url: '/works',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 0,
        isEnabled: true,
        parentId: 'default-works',
        children: [],
      },
      {
        id: 'def-w2',
        label: 'Open Source',
        url: '/opensource',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 1,
        isEnabled: true,
        parentId: 'default-works',
        children: [],
      },
      {
        id: 'def-w3',
        label: 'Architecture Highlights',
        url: '/works?category=backend',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 2,
        isEnabled: true,
        parentId: 'default-works',
        children: [],
      },
    ],
  },
  {
    id: 'default-writing',
    label: 'Writing',
    url: '/blogs',
    location: NavLocation.Footer,
    itemType: NavItemType.Group,
    description: null,
    icon: null,
    badge: null,
    config: {},
    isExternal: false,
    sortOrder: 1,
    isEnabled: true,
    parentId: null,
    children: [
      {
        id: 'def-b1',
        label: 'Technical Essays',
        url: '/blogs',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 0,
        isEnabled: true,
        parentId: 'default-writing',
        children: [],
      },
      {
        id: 'def-b2',
        label: 'Research Publications',
        url: '/research',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 1,
        isEnabled: true,
        parentId: 'default-writing',
        children: [],
      },
      {
        id: 'def-b3',
        label: 'Newsletter Archive',
        url: '/newsletter',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 2,
        isEnabled: true,
        parentId: 'default-writing',
        children: [],
      },
    ],
  },
  {
    id: 'default-journey',
    label: 'Journey',
    url: '/about',
    location: NavLocation.Footer,
    itemType: NavItemType.Group,
    description: null,
    icon: null,
    badge: null,
    config: {},
    isExternal: false,
    sortOrder: 2,
    isEnabled: true,
    parentId: null,
    children: [
      {
        id: 'def-j1',
        label: 'About & Philosophy',
        url: '/about',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 0,
        isEnabled: true,
        parentId: 'default-journey',
        children: [],
      },
      {
        id: 'def-j2',
        label: 'Skills Matrix',
        url: '/skills',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 1,
        isEnabled: true,
        parentId: 'default-journey',
        children: [],
      },
      {
        id: 'def-j3',
        label: 'Career Timeline',
        url: '/my-timeline',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 2,
        isEnabled: true,
        parentId: 'default-journey',
        children: [],
      },
      {
        id: 'def-j4',
        label: 'Verified Resume',
        url: '/resume',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 3,
        isEnabled: true,
        parentId: 'default-journey',
        children: [],
      },
    ],
  },
  {
    id: 'default-resources',
    label: 'Platform',
    url: '/now',
    location: NavLocation.Footer,
    itemType: NavItemType.Group,
    description: null,
    icon: null,
    badge: null,
    config: {},
    isExternal: false,
    sortOrder: 3,
    isEnabled: true,
    parentId: null,
    children: [
      {
        id: 'def-r1',
        label: 'Now',
        url: '/now',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 0,
        isEnabled: true,
        parentId: 'default-resources',
        children: [],
      },
      {
        id: 'def-r2',
        label: 'Tech Stack (Uses)',
        url: '/uses',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 1,
        isEnabled: true,
        parentId: 'default-resources',
        children: [],
      },
      {
        id: 'def-r3',
        label: 'Guestbook',
        url: '/guestbook',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 2,
        isEnabled: true,
        parentId: 'default-resources',
        children: [],
      },
      {
        id: 'def-r4',
        label: 'Get in Touch',
        url: '/contact',
        location: NavLocation.Footer,
        itemType: NavItemType.Link,
        description: null,
        icon: null,
        badge: null,
        config: {},
        isExternal: false,
        sortOrder: 3,
        isEnabled: true,
        parentId: 'default-resources',
        children: [],
      },
    ],
  },
];

const DEFAULT_SOCIALS: SocialLinkDto[] = [
  {
    id: '1',
    platform: 'GitHub',
    label: 'GitHub',
    url: 'https://github.com/AnujYadav-Dev',
    icon: 'github',
    sortOrder: 0,
    isEnabled: true,
  },
  {
    id: '2',
    platform: 'LinkedIn',
    label: 'LinkedIn',
    url: 'https://linkedin.com/in/anujyadav',
    icon: 'linkedin',
    sortOrder: 1,
    isEnabled: true,
  },
  {
    id: '3',
    platform: 'X',
    label: 'X (Twitter)',
    url: 'https://x.com/anujyadav',
    icon: 'twitter',
    sortOrder: 2,
    isEnabled: true,
  },
  {
    id: '4',
    platform: 'Email',
    label: 'Email',
    url: 'mailto:anujyadav9449@gmail.com',
    icon: 'mail',
    sortOrder: 3,
    isEnabled: true,
  },
];

export function Footer() {
  const { data: navData } = useNavItems('footer');
  const { data: socialData } = useSocialLinks();
  const { data: settingsData } = useSiteSettings();

  const authorName =
    settingsData?.data?.['author_name'] ||
    settingsData?.data?.['author.name'] ||
    settingsData?.data?.['site_title'] ||
    'Anuj Yadav';
  const authorEmail = settingsData?.data?.['author_email'] || 'anujyadav9449@gmail.com';

  const footerSections =
    navData?.data && navData.data.length > 0 ? navData.data : DEFAULT_FOOTER_COLUMNS;
  const socials =
    socialData?.data && socialData.data.length > 0 ? socialData.data : DEFAULT_SOCIALS;

  return (
    <footer
      role="contentinfo"
      aria-label="Footer"
      className="w-full bg-background border-t border-border mt-auto transition-colors duration-fast"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col gap-10">
        {/* Large Typographic Name Display */}
        <FooterNameBanner name={authorName} />

        {/* Newsletter & Availability Section */}
        {/* <FooterNewsletter /> */}

        {/* Main Multi-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Brand & Socials Column (Left 4 cols) */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col justify-between">
            <FooterBrand portfolioName={authorName} socials={socials} />
          </div>

          {/* Categorized Navigation Columns (Right 8 cols) */}
          <nav
            aria-label="Footer Navigation"
            className="md:col-span-8 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {footerSections.map((section) => (
              <FooterColumn key={section.id} section={section} />
            ))}
          </nav>
        </div>

        {/* Developer Hub & Syndication Links Strip */}
        <FooterDeveloperHub authorEmail={authorEmail} />

        {/* Bottom Bar: Availability Status & Segmented Theme Control */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-muted">
          {/* Live Availability Status */}
          <div className="flex items-center gap-2 select-none">
            {/* <span className="relative flex h-2 w-2">
              {isAvailable && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAvailable ? 'bg-success' : 'bg-muted'
                }`}
              />
            </span>
            <span className="font-mono text-[11px] text-muted">
              {isAvailable
                ? 'Available for engineering roles & architecture consulting'
                : 'Currently occupied on active projects'}
            </span> */}
            {/* Newsletter & Availability Section */}
            <FooterNewsletter />
          </div>

          {/* 3-Mode Segmented Theme Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <FooterThemeControl />
          </div>
        </div>
      </div>
    </footer>
  );
}
