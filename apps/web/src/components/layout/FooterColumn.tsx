'use client';

import * as React from 'react';
import Link from 'next/link';
import type { NavItemDto } from '@portfolio/shared';
import { ArrowUpRight } from 'lucide-react';
import { NavIcon } from './NavIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export interface FooterColumnProps {
  section: NavItemDto;
  className?: string;
}

export function FooterColumn({ section, className }: FooterColumnProps) {
  const hasChildren = section.children && section.children.length > 0;
  const links = hasChildren ? section.children : [section];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Column / Category Section Heading */}
      <span className="text-xs font-mono font-semibold capitalize text-foreground select-none">
        {section.label}
      </span>

      {/* Links List */}
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {links.map((link) => {
          const isExternal = link.isExternal || (link.url && (link.url.startsWith('http://') || link.url.startsWith('https://')));

          return (
            <li key={link.id} className="m-0 p-0">
              {isExternal ? (
                <a
                  href={link.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-fast select-none"
                >
                  {link.icon && (
                    <NavIcon
                      name={link.icon}
                      className="w-3 h-3 text-muted/80 group-hover:text-accent transition-colors shrink-0"
                    />
                  )}
                  <span className="group-hover:underline underline-offset-4">{link.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted/60 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  {link.badge && (
                    <Badge variant="outline" size="sm" className="text-[9px] py-0 px-1 font-mono">
                      {link.badge}
                    </Badge>
                  )}
                </a>
              ) : (
                <Link
                  href={link.url || '#'}
                  className="group inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-fast select-none"
                >
                  {link.icon && (
                    <NavIcon
                      name={link.icon}
                      className="w-3 h-3 text-muted/80 group-hover:text-accent transition-colors shrink-0"
                    />
                  )}
                  <span className="group-hover:underline underline-offset-4">{link.label}</span>
                  {link.badge && (
                    <Badge variant="outline" size="sm" className="text-[9px] py-0 px-1 font-mono">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              )}

              {link.description && (
                <p className="text-[11px] text-muted/70 leading-tight mt-0.5 line-clamp-1">
                  {link.description}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
