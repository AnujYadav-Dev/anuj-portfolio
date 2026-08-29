import { prisma } from '@/config/prisma';
import type { PublicStatsDto } from '@portfolio/shared';

export const statsService = {
  async getPublicStats(): Promise<PublicStatsDto> {
    const [
      totalProjects,
      totalBlogPosts,
      totalResearchPapers,
      totalSkills,
      experiences,
      openSourceRepos,
      publishedBlogPosts,
      publishedProjects,
      distinctCountries,
    ] = await Promise.all([
      prisma.project.count({ where: { status: 'published' } }),
      prisma.blogPost.count({ where: { status: 'published' } }),
      prisma.researchPaper.count({ where: { status: 'published' } }),
      prisma.skill.count({ where: { isEnabled: true } }),
      prisma.experience.findMany({
        where: { isEnabled: true },
        orderBy: { startDate: 'asc' },
        select: { startDate: true },
      }),
      prisma.opensourceContribution.findMany({
        where: { isEnabled: true },
        select: { stars: true },
      }),
      prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { readingTimeMinutes: true, content: true },
      }),
      prisma.project.findMany({
        where: { status: 'published' },
        select: { technologies: true, content: true },
      }),
      prisma.visitor.groupBy({
        by: ['country'],
        where: { country: { not: null } },
      }),
    ]);

    let yearsOfExperience = 0;
    const firstExperience = experiences[0];
    if (firstExperience) {
      const earliest = new Date(firstExperience.startDate);
      const now = new Date();
      const diffMs = now.getTime() - earliest.getTime();
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      yearsOfExperience = Math.max(1, Math.round(diffYears * 10) / 10);
    }

    const totalGithubStars = openSourceRepos.reduce((acc, repo) => acc + (repo.stars ?? 0), 0);

    const totalReadingTimeMinutes = publishedBlogPosts.reduce(
      (acc, p) =>
        acc +
        (p.readingTimeMinutes ||
          Math.max(1, Math.round((p.content?.split(/\s+/).filter(Boolean).length || 0) / 200))),
      0,
    );

    const totalWordsWritten = [...publishedBlogPosts, ...publishedProjects].reduce(
      (acc, item) => acc + (item.content ? item.content.split(/\s+/).filter(Boolean).length : 0),
      0,
    );

    const techCounts: Record<string, number> = {};
    for (const proj of publishedProjects) {
      if (Array.isArray(proj.technologies)) {
        for (const tech of proj.technologies) {
          if (tech) {
            techCounts[tech] = (techCounts[tech] || 0) + 1;
          }
        }
      }
    }

    const topTechnologies = Object.entries(techCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const totalCountriesCount = distinctCountries.length;

    return {
      totalProjects,
      totalBlogPosts,
      totalResearchPapers,
      totalSkills,
      totalExperiences: experiences.length,
      yearsOfExperience,
      totalOpenSourceRepos: openSourceRepos.length,
      totalGithubStars,
      totalReadingTimeMinutes,
      totalWordsWritten,
      totalCountriesCount,
      topTechnologies,
      updatedAt: new Date().toISOString(),
    };
  },
};
