import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProjectListItemDto } from '@portfolio/shared';
import { cn } from '@/lib/cn';

export interface ProjectCardProps {
  project: ProjectListItemDto;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const caseStudyUrl = project.author?.username
    ? `/works/by/${project.author.username}/${project.slug}`
    : `/works/${project.slug}`;

  return (
    <Card
      className={cn(
        'group flex flex-col justify-between bg-surface border-border hover:border-muted transition-all duration-fast overflow-hidden',
        className,
      )}
    >
      <div>
        {/* Project Thumbnail Image if exists */}
        {project.coverImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden bg-surface-muted border-b border-border">
            <Image
              src={project.coverImageUrl}
              alt={project.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-normal group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-2">
            {project.category && (
              <span className="text-[11px] font-mono text-muted uppercase">
                {project.category.name}
              </span>
            )}
            {project.isFeatured && (
              <Badge variant="accent" size="sm">
                FEATURED
              </Badge>
            )}
          </div>
          <Link href={caseStudyUrl} className="group-hover:text-accent transition-colors">
            <CardTitle className="text-md group-hover:text-accent transition-colors flex items-center justify-between">
              <span>{project.title}</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </CardTitle>
          </Link>
          <CardDescription className="line-clamp-2 mt-1">
            {project.shortDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 5).map((tech: string) => (
              <Badge key={tech} variant="outline" size="sm">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 5 && (
              <Badge variant="default" size="sm">
                +{project.technologies.length - 5}
              </Badge>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="justify-between border-t border-border mt-4 pt-3 text-xs text-muted">
        <Badge variant="outline" size="sm">
          {project.projectType.toUpperCase()}
        </Badge>

        <Link
          href={caseStudyUrl}
          className="text-xs font-semibold text-accent hover:underline underline-offset-4"
        >
          Case Study →
        </Link>
      </CardFooter>
    </Card>
  );
}
