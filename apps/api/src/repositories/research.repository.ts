import { prisma } from '@/config/prisma';
import type { ContentStatus, Prisma } from '@prisma/client';

const researchDetailedInclude = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
    },
  },
  pdf: { select: { url: true, filename: true, mimeType: true } },
  ogImage: { select: { url: true } },
};

export interface FindResearchParams {
  where?: Prisma.ResearchPaperWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.ResearchPaperOrderByWithRelationInput;
}

export const researchRepository = {
  async findMany(params: FindResearchParams) {
    return prisma.researchPaper.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy ?? { publishedAt: 'desc' },
      include: researchDetailedInclude,
    });
  },

  async count(where?: Prisma.ResearchPaperWhereInput) {
    return prisma.researchPaper.count({ where });
  },

  async findById(id: string) {
    return prisma.researchPaper.findUnique({
      where: { id },
      include: researchDetailedInclude,
    });
  },

  async findBySlugAndAuthor(authorUsername: string, slug: string) {
    const author = await prisma.author.findUnique({
      where: { username: authorUsername },
      select: { id: true },
    });
    if (!author) return null;

    return prisma.researchPaper.findUnique({
      where: {
        authorId_slug: {
          authorId: author.id,
          slug,
        },
      },
      include: researchDetailedInclude,
    });
  },

  async findBySlug(slug: string) {
    return prisma.researchPaper.findFirst({
      where: { slug },
      include: researchDetailedInclude,
    });
  },

  async getResearchTags(paperId: string): Promise<string[]> {
    const entityTags = await prisma.entityTag.findMany({
      where: { entityType: 'research_paper', entityId: paperId },
      include: { tag: { select: { name: true } } },
    });
    return entityTags.map((et) => et.tag.name);
  },

  async create(data: Prisma.ResearchPaperUncheckedCreateInput, tagIds?: string[]) {
    return prisma.$transaction(async (tx) => {
      const paper = await tx.researchPaper.create({
        data,
        include: researchDetailedInclude,
      });

      if (tagIds && tagIds.length > 0) {
        await tx.entityTag.createMany({
          data: tagIds.map((tagId) => ({
            tagId,
            entityType: 'research_paper' as const,
            entityId: paper.id,
          })),
          skipDuplicates: true,
        });
      }

      return paper;
    });
  },

  async update(id: string, data: Prisma.ResearchPaperUncheckedUpdateInput, tagIds?: string[]) {
    return prisma.$transaction(async (tx) => {
      const paper = await tx.researchPaper.update({
        where: { id },
        data,
        include: researchDetailedInclude,
      });

      if (tagIds !== undefined) {
        await tx.entityTag.deleteMany({
          where: { entityType: 'research_paper', entityId: id },
        });
        if (tagIds.length > 0) {
          await tx.entityTag.createMany({
            data: tagIds.map((tagId) => ({
              tagId,
              entityType: 'research_paper' as const,
              entityId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return paper;
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.entityTag.deleteMany({
        where: { entityType: 'research_paper', entityId: id },
      });
      return tx.researchPaper.delete({ where: { id } });
    });
  },

  async updateStatus(id: string, status: ContentStatus, publishedAt?: Date | null) {
    return prisma.researchPaper.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'published' ? (publishedAt ?? new Date()) : publishedAt,
      },
      include: researchDetailedInclude,
    });
  },
};
