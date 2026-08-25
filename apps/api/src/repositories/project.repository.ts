import { prisma } from '@/config/prisma';
import type { ContentStatus, Prisma } from '@prisma/client';

const projectDetailedInclude = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: { select: { url: true } },
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  coverImage: { select: { url: true } },
  ogImage: { select: { url: true } },
  images: {
    include: {
      media: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
};

export interface FindProjectsParams {
  where?: Prisma.ProjectWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.ProjectOrderByWithRelationInput;
}

export const projectRepository = {
  async findMany(params: FindProjectsParams) {
    return prisma.project.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy ?? { sortOrder: 'asc' },
      include: projectDetailedInclude,
    });
  },

  async count(where?: Prisma.ProjectWhereInput) {
    return prisma.project.count({ where });
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: projectDetailedInclude,
    });
  },

  async findBySlugAndAuthor(authorUsername: string, slug: string) {
    const author = await prisma.author.findUnique({
      where: { username: authorUsername },
      select: { id: true },
    });
    if (!author) return null;

    return prisma.project.findUnique({
      where: {
        authorId_slug: {
          authorId: author.id,
          slug,
        },
      },
      include: projectDetailedInclude,
    });
  },

  async findBySlug(slug: string) {
    return prisma.project.findFirst({
      where: { slug },
      include: projectDetailedInclude,
    });
  },

  async getProjectTags(projectId: string): Promise<string[]> {
    const entityTags = await prisma.entityTag.findMany({
      where: { entityType: 'project', entityId: projectId },
      include: { tag: { select: { name: true } } },
    });
    return entityTags.map((et) => et.tag.name);
  },

  async create(
    data: Prisma.ProjectUncheckedCreateInput,
    tagIds?: string[],
    mediaImages?: { mediaId: string; caption?: string; sortOrder?: number }[],
  ) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data,
        include: projectDetailedInclude,
      });

      if (tagIds && tagIds.length > 0) {
        await tx.entityTag.createMany({
          data: tagIds.map((tagId) => ({
            tagId,
            entityType: 'project' as const,
            entityId: project.id,
          })),
          skipDuplicates: true,
        });
      }

      if (mediaImages && mediaImages.length > 0) {
        await tx.projectImage.createMany({
          data: mediaImages.map((img, idx) => ({
            projectId: project.id,
            mediaId: img.mediaId,
            caption: img.caption ?? null,
            sortOrder: img.sortOrder ?? idx,
          })),
        });
      }

      return project;
    });
  },

  async update(
    id: string,
    data: Prisma.ProjectUncheckedUpdateInput,
    tagIds?: string[],
    mediaImages?: { mediaId: string; caption?: string; sortOrder?: number }[],
  ) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id },
        data,
        include: projectDetailedInclude,
      });

      if (tagIds !== undefined) {
        await tx.entityTag.deleteMany({
          where: { entityType: 'project', entityId: id },
        });
        if (tagIds.length > 0) {
          await tx.entityTag.createMany({
            data: tagIds.map((tagId) => ({
              tagId,
              entityType: 'project' as const,
              entityId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (mediaImages !== undefined) {
        await tx.projectImage.deleteMany({ where: { projectId: id } });
        if (mediaImages.length > 0) {
          await tx.projectImage.createMany({
            data: mediaImages.map((img, idx) => ({
              projectId: id,
              mediaId: img.mediaId,
              caption: img.caption ?? null,
              sortOrder: img.sortOrder ?? idx,
            })),
          });
        }
      }

      return project;
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.entityTag.deleteMany({
        where: { entityType: 'project', entityId: id },
      });
      await tx.projectImage.deleteMany({
        where: { projectId: id },
      });
      return tx.project.delete({ where: { id } });
    });
  },

  async updateStatus(id: string, status: ContentStatus, publishedAt?: Date | null) {
    return prisma.project.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'published' ? (publishedAt ?? new Date()) : publishedAt,
      },
      include: projectDetailedInclude,
    });
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.project.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
  },
};
