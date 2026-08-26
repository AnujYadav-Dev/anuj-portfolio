import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ResearchPaperListItemDto } from '@portfolio/shared';

export interface ResearchPaperCardProps {
  paper: ResearchPaperListItemDto;
}

export function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  const publishDate = paper.publishedAt
    ? new Date(paper.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';


  return (
    <Card className="bg-surface border-border hover:border-muted transition-all duration-fast">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 mb-2">
          {paper.publicationName && (
            <Badge variant="accent" size="sm">
              {paper.publicationName}
            </Badge>
          )}
          {publishDate && <span className="text-xs font-mono text-muted">{publishDate}</span>}
        </div>

        <Link href={`/research/${paper.slug}`}>
          <CardTitle className="text-md hover:text-accent transition-colors">
            {paper.title}
          </CardTitle>
        </Link>

        {paper.author && (
          <p className="text-xs font-mono text-muted pt-1">Author: {paper.author.displayName}</p>
        )}

        {paper.abstract && (
          <CardDescription className="line-clamp-3 mt-2">{paper.abstract}</CardDescription>
        )}
      </CardHeader>

      <CardFooter className="justify-between border-t border-border mt-4 pt-3 text-xs">
        <span className="text-xs text-muted font-mono">{paper.publicationDate || 'Preprint'}</span>

        <Link href={`/research/${paper.slug}`}>
          <Button variant="outline" size="sm">
            View Paper →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
