'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Code, Terminal, ExternalLink } from 'lucide-react';
import { GitHubIcon } from '@/components/common/Icons';
import { SplitSection } from '@/components/common/SplitSection';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useProjects } from '@/hooks/useProjects';

export function WorksBento() {
  const { data: projectsData, isLoading } = useProjects({ isFeatured: true, pageSize: 2 });
  const featuredProject = projectsData?.data?.[0];

  const verbs = [
    'architecting..',
    'benchmarking..',
    'crafting..',
    'debugging..',
    'deploying..',
    'optimizing..',
  ];
  const [activeVerbIndex, setActiveVerbIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveVerbIndex((prev) => (prev + 1) % verbs.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [verbs.length]);

  return (
    <SplitSection
      labelNumber="02 // WORKS"
      labelTitle="Selected Works"
      labelSubtitle="Featured Projects & Case Studies"
      id="works"
    >
      <div className="flex flex-col gap-6">
        {/* Section Headline */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
            NOW A SOFTWARE ENGINEER
          </h3>
          <Link
            href="/works"
            className="text-xs font-semibold text-accent hover:text-accent-hover underline decoration-accent/40 hover:decoration-accent underline-offset-4 flex items-center gap-1"
          >
            <span>All Projects ({projectsData?.pagination?.totalItems ?? 0})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bento Pair Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Card: Monospace ASCII Status Matrix */}
          <div className="md:col-span-5 flex flex-col">
            <RevealOnScroll delayIndex={1} className="h-full">
              <Card className="h-full flex flex-col justify-between p-6 bg-surface border-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-accent" />
                      <span className="text-xs font-mono font-semibold text-foreground">
                        SYSTEM.STATUS
                      </span>
                    </div>
                    <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
                  </div>

                  <div className="flex flex-col gap-2 font-mono text-xs text-muted">
                    <div className="flex justify-between">
                      <span>STATUS:</span>
                      <span className="text-accent font-semibold">{verbs[activeVerbIndex]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RUNTIME:</span>
                      <span className="text-foreground">NODE_V20 / NEXT16</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UPTIME:</span>
                      <span className="text-foreground">99.98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LOCATION:</span>
                      <span className="text-foreground">UTC+05:30</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6 text-[11px] font-mono text-placeholder leading-relaxed">
                  {'// Built for resilience, clean code boundaries, and sub-100ms response times.'}
                </div>
              </Card>
            </RevealOnScroll>
          </div>

          {/* Right Card: Featured Case Study */}
          <div className="md:col-span-7 flex flex-col">
            <RevealOnScroll delayIndex={2} className="h-full">
              <Card className="h-full flex flex-col justify-between bg-surface border-border overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="accent" size="sm">
                      FEATURED PROJECT
                    </Badge>
                    {featuredProject?.category && (
                      <span className="text-xs font-mono text-muted">
                        {featuredProject.category.name}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    {featuredProject?.title || 'Distributed Portfolio Architecture'}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {featuredProject?.shortDescription ||
                      'Full-stack dynamic developer portfolio platform with multi-layered Express REST API, PostgreSQL database, and accessible Next.js 16 frontend.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      featuredProject?.technologies || [
                        'TypeScript',
                        'Next.js',
                        'PostgreSQL',
                        'Prisma',
                        'Tailwind CSS',
                      ]
                    ).map((tech: string) => (
                      <Badge key={tech} variant="outline" size="sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="justify-between border-t border-border mt-4 pt-4">
                  <Badge variant="outline" size="sm">
                    {featuredProject?.projectType?.toUpperCase() || 'PERSONAL'}
                  </Badge>

                  <Link href={featuredProject?.slug ? `/works/${featuredProject.slug}` : '/works'}>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                    >
                      Read Case Study
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </SplitSection>
  );
}
