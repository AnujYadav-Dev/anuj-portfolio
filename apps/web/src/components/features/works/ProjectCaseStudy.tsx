'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { GitHubIcon } from '@/components/common/Icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { ZoomableImage } from '@/components/content/ZoomableImage';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { ProjectDto } from '@portfolio/shared';

export interface ProjectCaseStudyProps {
  project: ProjectDto;
}

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  const startDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';
  const endDate = project.endDate
    ? new Date(project.endDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Present';

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors select-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all works</span>
          </Link>
        </div>

        {/* Case Study Header */}
        <RevealOnScroll>
          <div className="flex flex-col gap-6 max-w-4xl pb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              {project.category && (
                <Badge variant="accent" size="sm">
                  {project.category.name}
                </Badge>
              )}
              <Badge variant="outline" size="sm">
                {project.projectType.toUpperCase()}
              </Badge>
              {project.isFeatured && (
                <Badge variant="success" size="sm">
                  FEATURED
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {project.title}
            </h1>

            <p className="text-md text-muted leading-relaxed">{project.shortDescription}</p>

            {/* Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-md border border-border bg-surface text-xs font-mono">
              {startDate && (
                <div>
                  <span className="text-muted block">TIMELINE</span>
                  <span className="text-foreground font-semibold">
                    {startDate} — {endDate}
                  </span>
                </div>
              )}
              {project.author && (
                <div>
                  <span className="text-muted block">AUTHOR</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Avatar
                      src={project.author.avatarUrl}
                      fallbackText={project.author.displayName}
                      size="sm"
                      className="h-5 w-5 text-[9px]"
                    />
                    <span className="text-foreground font-semibold">
                      {project.author.displayName}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted block">STATUS</span>
                <span className="text-success font-semibold uppercase">
                  {project.projectStatus}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ExternalLink className="h-4 w-4" />}
                  >
                    View Live Website
                  </Button>
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="md" leftIcon={<GitHubIcon className="h-4 w-4" />}>
                    View Source Code
                  </Button>
                </a>
              )}
            </div>
          </div>
        </RevealOnScroll>

        {/* Tech Stack Pills */}
        <div className="py-6 border-b border-border">
          <span className="text-xs font-mono text-muted uppercase tracking-wider block mb-3">
            Technologies & Tools
          </span>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <Badge key={t} variant="default" size="md">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Hero Banner / Cover */}
        {project.coverImageUrl && (
          <div className="my-8 rounded-lg overflow-hidden border border-border bg-surface">
            <ZoomableImage
              src={project.coverImageUrl}
              alt={project.title}
              caption={`${project.title} - Main Interface`}
            />
          </div>
        )}

        {/* Markdown Case Study Body */}
        {project.content && (
          <RevealOnScroll>
            <div className="py-8 max-w-4xl">
              <MarkdownRenderer content={project.content} />
            </div>
          </RevealOnScroll>
        )}
      </div>
    </div>
  );
}
