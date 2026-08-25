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

    return {
      totalProjects,
      totalBlogPosts,
      totalResearchPapers,
      totalSkills,
      totalExperiences: experiences.length,
      yearsOfExperience,
      totalOpenSourceRepos: openSourceRepos.length,
      totalGithubStars,
      updatedAt: new Date().toISOString(),
    };
  },
};
