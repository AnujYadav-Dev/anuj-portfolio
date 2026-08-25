'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { usePublicStats } from '@/hooks/useDiscovery';

export default function StatsPage() {
  const { data: statsData, isLoading } = usePublicStats();
  const stats = statsData?.data;

  const metrics = [
    {
      label: 'Software Projects',
      value: stats?.totalProjects ?? 0,
      icon: <Briefcase className="h-5 w-5 text-accent" />,
      description: 'Production systems, open-source tools, and client platforms.',
    },
    {
      label: 'Technical Essays',
      value: stats?.totalBlogPosts ?? 0,
      icon: <BookOpen className="h-5 w-5 text-accent" />,
      description: 'In-depth articles, tutorials, and architecture notes.',
    },
    {
      label: 'Research Papers',
      value: stats?.totalResearchPapers ?? 0,
      icon: <FileText className="h-5 w-5 text-accent" />,
      description: 'Formal academic preprints and conference publications.',
    },
    {
      label: 'Technologies & Tools',
      value: stats?.totalSkills ?? 0,
      icon: <Code className="h-5 w-5 text-accent" />,
      description: 'Languages, frameworks, databases, and infrastructure tooling.',
    },
    {
      label: 'Years of Experience',
      value: stats?.yearsOfExperience ?? 0,
      icon: <Calendar className="h-5 w-5 text-accent" />,
      description: 'Years architecting and building high-scale applications.',
    },
    {
      label: 'Open Source Repos',
      value: stats?.totalOpenSourceRepos ?? 0,
      icon: <GitBranch className="h-5 w-5 text-accent" />,
      description: 'Public packages and contributions on GitHub.',
    },
    {
      label: 'GitHub Stars Earned',
      value: stats?.totalGithubStars ?? 0,
      icon: <Star className="h-5 w-5 text-warning" />,
      description: 'Stars across open-source repositories.',
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="PLATFORM METRICS & TELEMETRY"
        title="Dynamic Statistics & Numbers"
        description="Real-time aggregation of portfolio data, publications, open-source repositories, and experience metrics."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-40 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric, idx) => (
                <RevealOnScroll key={metric.label} delayIndex={(idx % 4 + 1) as 1 | 2 | 3 | 4}>
                  <Card className="bg-surface border-border p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-muted uppercase tracking-wider">
                          {metric.label}
                        </span>
                        {metric.icon}
                      </div>

                      <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                        {metric.value}
                      </div>
                    </div>

                    <p className="text-xs text-muted leading-relaxed mt-4 pt-3 border-t border-border/60">
                      {metric.description}
                    </p>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          )}

          {stats?.updatedAt && (
            <div className="text-xs font-mono text-muted text-center pt-6 flex items-center justify-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>
                Telemetry synced on {new Date(stats.updatedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
