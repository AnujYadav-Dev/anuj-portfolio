'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { ResearchPaperDto } from '@portfolio/shared';

interface ResearchDetailsClientProps {
  paper: ResearchPaperDto;
}

export function ResearchDetailsClient({ paper }: ResearchDetailsClientProps) {
  const publishDate = paper.publishedAt
    ? new Date(paper.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="mb-8">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors select-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to research publications</span>
          </Link>
        </div>

        <RevealOnScroll>
          <div className="flex flex-col gap-6 max-w-3xl pb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              {paper.publicationName && (
                <Badge variant="accent" size="sm">
                  {paper.publicationName}
                </Badge>
              )}
              {publishDate && <span className="text-xs font-mono text-muted">{publishDate}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {paper.title}
            </h1>

            {paper.author && (
              <p className="text-xs font-mono text-muted">Author: {paper.author.displayName}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {paper.pdfUrl && (
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="md" rightIcon={<Download className="h-4 w-4" />}>
                    Download Complete Paper (PDF)
                  </Button>
                </a>
              )}
              {paper.doi && (
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<ExternalLink className="h-4 w-4" />}
                  >
                    View DOI Record
                  </Button>
                </a>
              )}
            </div>
          </div>
        </RevealOnScroll>

        <div className="py-8 max-w-3xl flex flex-col gap-6">
          {paper.abstract && (
            <div>
              <h3 className="text-sm font-mono font-semibold text-accent uppercase tracking-wider mb-2">
                Abstract
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">{paper.abstract}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
