'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';
import { SplitSection } from '@/components/common/SplitSection';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/cn';
import { formatSectionTag, type DynamicSectionProps } from './types';

export function WorksBento({ section, index }: DynamicSectionProps) {
  const limit = (section?.config?.limit as number) || 4;
  const { data: projectsData } = useProjects({ isFeatured: true, pageSize: limit });
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const projects = projectsData?.data || [];

  const sectionTitle = section?.title || 'Featured Works';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Featured Projects & Architecture Deep-Dives';

  const labelNumber = formatSectionTag({
    index,
    showSectionNumber: section?.config?.showSectionNumber !== false,
    labelTag: (section?.config?.labelTag as string) || 'WORKS',
    tagSeparator: (section?.config?.tagSeparator as string) ?? '//',
    customLabelNumber: section?.config?.labelNumber as string,
  });

  const ctaLabel =
    (section?.config?.ctaLabel as string) ||
    `All Projects (${projectsData?.pagination?.totalItems ?? 0})`;
  const ctaUrl = (section?.config?.ctaUrl as string) || '/works';
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id="works"
    >
      <div className="flex flex-col gap-6">
        {/* Section Headline & All Projects Link */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
            SELECTED WORKS
          </h3>
          <Link
            href={ctaUrl}
            target={ctaTarget === '_blank' ? '_blank' : undefined}
            rel={ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 flex items-center gap-1 transition-colors"
          >
            <span>{ctaLabel}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Minimal Project Stream List (Matching Blogs Stream Aesthetic) */}
        <div className="flex flex-col border-t border-border">
          {projects.length > 0 ? (
            projects.map((project, idx) => {
              const isHovered = hoveredId === project.id;
              const projectDate = project.publishedAt
                ? new Date(project.publishedAt).getFullYear()
                : '2026';

              return (
                <RevealOnScroll key={project.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <div
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'group block py-4 border-b border-border transition-all duration-fast',
                      isHovered && 'bg-surface/50 px-3 -mx-3 rounded-sm',
                    )}
                  >
                    {/* Primary Row Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderGit2 className="h-3.5 w-3.5 text-muted group-hover:text-accent transition-colors shrink-0" />
                        <Link
                          href={`/works/${project.slug}`}
                          className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors truncate"
                        >
                          {project.title}
                        </Link>
                        {project.category && (
                          <span className="text-xs text-muted italic shrink-0 hidden sm:inline">
                            in {project.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-muted">
                        <Badge variant="outline" size="sm" className="text-[10px] uppercase">
                          {project.projectType || 'FEATURED'}
                        </Badge>
                        <span>{projectDate}</span>
                      </div>
                    </div>

                    {/* Expandable Hover Details Drawer */}
                    {isHovered && (
                      <div className="mt-3 pt-2.5 border-t border-border/40 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-instant">
                        {project.shortDescription && (
                          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                            {project.shortDescription}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          {/* Tech stack badges */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {project.technologies.map((t) => (
                                <Badge key={t} variant="outline" size="sm" className="text-[10px]">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Action link */}
                          <div className="flex items-center gap-3 ml-auto text-xs font-semibold">
                            <Link
                              href={`/works/${project.slug}`}
                              className="text-accent hover:text-accent-hover inline-flex items-center gap-1 transition-colors"
                            >
                              <span>Read Case Study</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </RevealOnScroll>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted font-mono">
              No featured projects available yet.
            </div>
          )}
        </div>
      </div>
    </SplitSection>
  );
}
