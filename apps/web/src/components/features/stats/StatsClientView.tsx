'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import {
  Briefcase,
  BookOpen,
  FileText,
  Code,
  Calendar,
  GitBranch,
  Star,
  Activity,
  Globe2,
  Clock,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { usePublicStats } from '@/hooks/useDiscovery';

export function StatsClientView() {
  const { data: statsData, isLoading } = usePublicStats();
  const stats = statsData?.data;

  const engineeringMetrics = [
    {
      label: 'Software Systems',
      value: stats?.totalProjects ?? 0,
      icon: <Briefcase className="h-5 w-5 text-accent" />,
      description: 'Production systems, distributed backends, and full-stack web applications.',
      link: '/works',
      linkLabel: 'View Projects',
    },
    {
      label: 'Years of Experience',
      value: stats?.yearsOfExperience ?? 0,
      icon: <Calendar className="h-5 w-5 text-accent" />,
      description: 'Years building high-performance systems and user interfaces.',
      link: '/experience',
      linkLabel: 'Career History',
    },
    {
      label: 'Open Source Repositories',
      value: stats?.totalOpenSourceRepos ?? 0,
      icon: <GitBranch className="h-5 w-5 text-accent" />,
      description: 'Public packages, developer tooling, and contributions.',
      link: '/open-source',
      linkLabel: 'Open Source',
    },
    {
      label: 'GitHub Stars Earned',
      value: stats?.totalGithubStars ?? 0,
      icon: <Star className="h-5 w-5 text-warning" />,
      description: 'Community recognition across open-source software.',
      link: '/open-source',
      linkLabel: 'Contributions',
    },
  ];

  const publicationMetrics = [
    {
      label: 'Technical Essays',
      value: stats?.totalBlogPosts ?? 0,
      icon: <BookOpen className="h-5 w-5 text-accent" />,
      description: 'In-depth engineering notes, design patterns, and case studies.',
      link: '/blogs',
      linkLabel: 'Read Articles',
    },
    {
      label: 'Research Papers',
      value: stats?.totalResearchPapers ?? 0,
      icon: <FileText className="h-5 w-5 text-accent" />,
      description: 'Formal academic preprints and research publications.',
      link: '/research',
      linkLabel: 'Research Papers',
    },
    {
      label: 'Cumulative Reading Time',
      value: `${stats?.totalReadingTimeMinutes ?? 0}m`,
      icon: <Clock className="h-5 w-5 text-accent" />,
      description: 'Estimated total reading time across technical essays and architecture deep-dives.',
    },
    {
      label: 'Total Words Authored',
      value: stats?.totalWordsWritten ? stats.totalWordsWritten.toLocaleString() : '0',
      icon: <Sparkles className="h-5 w-5 text-accent" />,
      description: 'Total technical prose and architectural explanations published on the platform.',
    },
  ];

  const topTechnologies = stats?.topTechnologies || [];
  const countriesCount = stats?.totalCountriesCount || 0;

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="PLATFORM METRICS & TELEMETRY"
        title="Dynamic Statistics & Architecture Telemetry"
        description="Real-time aggregation of engineering output, technical publications, open-source impact, and global audience reach."
      />

      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col gap-14">
          {/* 1. Core Engineering & Systems Output */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h2 className="text-base font-bold text-foreground">Engineering & Systems Output</h2>
              </div>
              <span className="text-xs font-mono text-muted">01 // PRODUCTION</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-44 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {engineeringMetrics.map((metric, idx) => (
                  <RevealOnScroll key={metric.label} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                    <Card className="bg-surface border-border p-5 h-full flex flex-col justify-between hover:border-border-hover transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-muted uppercase tracking-wider">
                            {metric.label}
                          </span>
                          {metric.icon}
                        </div>

                        <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                          {metric.value}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2">
                        <p className="text-xs text-muted leading-relaxed">
                          {metric.description}
                        </p>
                        {metric.link && (
                          <Link
                            href={metric.link}
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 mt-1 pt-1 border-t border-border/30"
                          >
                            <span>{metric.linkLabel}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </Card>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>

          {/* 2. Technical Writing & Knowledge Depth */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <h2 className="text-base font-bold text-foreground">Technical Writing & Research Depth</h2>
              </div>
              <span className="text-xs font-mono text-muted">02 // PUBLICATIONS</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-44 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {publicationMetrics.map((metric, idx) => (
                  <RevealOnScroll key={metric.label} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                    <Card className="bg-surface border-border p-5 h-full flex flex-col justify-between hover:border-border-hover transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-muted uppercase tracking-wider">
                            {metric.label}
                          </span>
                          {metric.icon}
                        </div>

                        <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                          {metric.value}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2">
                        <p className="text-xs text-muted leading-relaxed">
                          {metric.description}
                        </p>
                        {metric.link && (
                          <Link
                            href={metric.link}
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 mt-1 pt-1 border-t border-border/30"
                          >
                            <span>{metric.linkLabel}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </Card>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>

          {/* 3. Tech Stack Distribution & Global Reader Reach Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tech Stack Frequency */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-accent" />
                  <h2 className="text-base font-bold text-foreground">Technology Footprint Across Works</h2>
                </div>
                <Link
                  href="/skills"
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                >
                  <span>Full Skills Matrix</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <Card className="bg-surface border-border p-6 h-full flex flex-col justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted leading-relaxed">
                    Most frequently deployed tools, frameworks, and database architectures across featured production systems and open-source repositories.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {topTechnologies.length > 0 ? (
                      topTechnologies.map((tech) => (
                        <div
                          key={tech.name}
                          className="p-3 bg-surface-muted/60 border border-border/70 rounded-md flex flex-col gap-1"
                        >
                          <span className="text-xs font-bold text-foreground truncate">
                            {tech.name}
                          </span>
                          <span className="text-[11px] font-mono text-muted">
                            {tech.count} {tech.count === 1 ? 'Project' : 'Projects'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-xs font-mono text-muted py-4">
                        Tech stack telemetry updating with published works...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs font-mono text-muted">
                  <span>Tracked across published works</span>
                  <span className="text-accent font-semibold">{stats?.totalSkills ?? 0} Total Skills Registered</span>
                </div>
              </Card>
            </div>

            {/* Global Audience Reach */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-accent" />
                  <h2 className="text-base font-bold text-foreground">Audience Footprint</h2>
                </div>
                <span className="text-xs font-mono text-muted">04 // REACH</span>
              </div>

              <Card className="bg-surface border-border p-6 h-full flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider">
                      Verified Reader Reach
                    </span>
                    <Globe2 className="h-5 w-5 text-accent" />
                  </div>

                  <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                    {countriesCount > 0 ? `${countriesCount}+ Countries` : 'Worldwide'}
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    Engineers, researchers, and technical recruiters reading published articles and inspecting system architectures across multiple continents.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted">
                  <span>Privacy-first telemetry</span>
                  <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                    Zero PII
                  </Badge>
                </div>
              </Card>
            </div>
          </div>

          {/* Sync status footer */}
          {stats?.updatedAt && (
            <div className="text-xs font-mono text-muted text-center pt-2 flex items-center justify-center gap-2">
              <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>Telemetry live synced • Last aggregated {new Date(stats.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

