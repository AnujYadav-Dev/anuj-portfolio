import { prisma } from '@/config/prisma';
import type { ContentStatus, Prisma } from '@prisma/client';

const blogDetailedInclude = {
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
};

export interface FindBlogPostsParams {
  where?: Prisma.BlogPostWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.BlogPostOrderByWithRelationInput;
}

export const blogRepository = {
  async findMany(params: FindBlogPostsParams) {
    return prisma.blogPost.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy ?? { publishedAt: 'desc' },
      include: blogDetailedInclude,
    });
  },

  async count(where?: Prisma.BlogPostWhereInput) {
    return prisma.blogPost.count({ where });
  },

  async findById(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
      include: blogDetailedInclude,
    });
  },

  async findBySlugAndAuthor(authorUsername: string, slug: string) {
    const author = await prisma.author.findUnique({
      where: { username: authorUsername },
      select: { id: true },
    });
    if (!author) return null;

    return prisma.blogPost.findUnique({
      where: {
        authorId_slug: {
          authorId: author.id,
          slug,
        },
      },
      include: blogDetailedInclude,
    });
  },

  async findBySlug(slug: string) {
    return prisma.blogPost.findFirst({
      where: { slug },
      include: blogDetailedInclude,
    });
  },

  async getBlogPostTags(blogPostId: string): Promise<string[]> {
    const entityTags = await prisma.entityTag.findMany({
      where: { entityType: 'blog_post', entityId: blogPostId },
      include: { tag: { select: { name: true } } },
    });
    return entityTags.map((et) => et.tag.name);
  },

  async create(data: Prisma.BlogPostUncheckedCreateInput, tagIds?: string[]) {
    return prisma.$transaction(async (tx) => {
      const post = await tx.blogPost.create({
        data,
        include: blogDetailedInclude,
      });

      if (tagIds && tagIds.length > 0) {
        await tx.entityTag.createMany({
          data: tagIds.map((tagId) => ({
            tagId,
            entityType: 'blog_post' as const,
            entityId: post.id,
          })),
          skipDuplicates: true,
        });
      }

      return post;
    });
  },

  async update(id: string, data: Prisma.BlogPostUncheckedUpdateInput, tagIds?: string[]) {
    return prisma.$transaction(async (tx) => {
      const post = await tx.blogPost.update({
        where: { id },
        data,
        include: blogDetailedInclude,
      });

      if (tagIds !== undefined) {
        await tx.entityTag.deleteMany({
          where: { entityType: 'blog_post', entityId: id },
        });
        if (tagIds.length > 0) {
          await tx.entityTag.createMany({
            data: tagIds.map((tagId) => ({
              tagId,
              entityType: 'blog_post' as const,
              entityId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return post;
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.entityTag.deleteMany({
        where: { entityType: 'blog_post', entityId: id },
      });
      return tx.blogPost.delete({ where: { id } });
    });
  },

  async updateStatus(id: string, status: ContentStatus, publishedAt?: Date | null) {
    return prisma.blogPost.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'published' ? (publishedAt ?? new Date()) : publishedAt,
      },
      include: blogDetailedInclude,
    });
  },

  async findVersions(blogPostId: string) {
    return prisma.contentVersion.findMany({
      where: { entityType: 'blog_post', entityId: blogPostId },
      orderBy: { version: 'desc' },
      include: {
        createdBy: { select: { displayName: true } },
      },
    });
  },

  async findVersion(blogPostId: string, version: number) {
    return prisma.contentVersion.findUnique({
      where: {
        entityType_entityId_version: {
          entityType: 'blog_post',
          entityId: blogPostId,
          version,
        },
      },
    });
  },
};
