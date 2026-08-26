'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { GitHubIcon } from '@/components/common/Icons';
import { Star, GitFork, Code } from 'lucide-react';
import { useOpenSource } from '@/hooks/useProfile';

export function OpenSourceClientView() {
  const { data: osData, isLoading } = useOpenSource();
  const contributions = osData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="OPEN SOURCE & ECOSYSTEM"
        title="Open Source Contributions & Libraries"
        description="Public repositories, developer packages, tools, and upstream contributions to the global open-source ecosystem."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-48 w-full rounded-md" />
              ))}
            </div>
          ) : contributions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributions.map((item, idx) => (
                <RevealOnScroll key={item.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <Card className="bg-surface border-border h-full flex flex-col justify-between hover:border-muted transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {item.role && (
                          <Badge variant="outline" size="sm">
                            {item.role}
                          </Badge>
                        )}
                        {item.isFeatured && (
                          <Badge variant="accent" size="sm">
                            FEATURED
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-md flex items-center gap-2">
                        <Code className="h-4 w-4 text-accent" />
                        <span>{item.name}</span>
                      </CardTitle>
                      {item.description && (
                        <CardDescription className="line-clamp-3 mt-1.5 leading-relaxed">
                          {item.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardFooter className="justify-between border-t border-border mt-4 pt-3 text-xs text-muted font-mono">
                      <div className="flex items-center gap-3">
                        {item.language && (
                          <span className="flex items-center gap-1 text-foreground">
                            <span className="h-2 w-2 rounded-full bg-accent inline-block" />
                            {item.language}
                          </span>
                        )}
                        {item.stars !== null && item.stars !== undefined && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-warning" />
                            {item.stars}
                          </span>
                        )}
                        {item.forks !== null && item.forks !== undefined && (
                          <span className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {item.forks}
                          </span>
                        )}
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline underline-offset-4 flex items-center gap-1 font-semibold"
                        >
                          <GitHubIcon className="h-3.5 w-3.5" />
                          <span>Repo</span>
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No open-source repositories listed yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
