import { prisma } from '@/config/prisma';

export const searchRepository = {
  async searchProjects(query: string, limit = 10) {
    return prisma.project.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { technologies: { hasSome: [query] } },
        ],
      },
      take: limit,
      include: {
        author: { select: { username: true } },
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  },

  async searchBlogPosts(query: string, limit = 10) {
    return prisma.blogPost.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        author: { select: { username: true } },
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  },

  async searchResearchPapers(query: string, limit = 10) {
    return prisma.researchPaper.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { abstract: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        author: { select: { username: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  },

  async searchSkills(query: string, limit = 10) {
    return prisma.skill.findMany({
      where: {
        isEnabled: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        category: { select: { name: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async searchPages(query: string, limit = 10) {
    return prisma.page.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async searchAboutSections(query: string, limit = 10) {
    return prisma.aboutSection.findMany({
      where: {
        isEnabled: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
  },
};
