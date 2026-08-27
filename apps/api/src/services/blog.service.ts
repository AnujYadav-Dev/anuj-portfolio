import { blogRepository } from '@/repositories/blog.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { contentBroadcastService } from '@/services/contentBroadcast.service';
import { logger } from '@/config/logger';
import {
  mapBlogPostToDto,
  mapBlogPostToListItemDto,
  mapContentVersionToDto,
} from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { saveContentVersion } from '@/utils/versioning';
import { calculateReadingTime } from '@/utils/readingTime';
import { slugify } from '@/utils/slug';
import { NotFoundError, ConflictError } from '@/utils/errors';
import type {
  BlogPostDto,
  BlogPostListItemDto,
  ContentVersionDto,
  CreateBlogPostInput,
  ListBlogPostsQuery,
  PaginatedResponse,
  UpdateBlogPostInput,
} from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const blogService = {
  async listPublished(query: ListBlogPostsQuery): Promise<PaginatedResponse<BlogPostListItemDto>> {
    const now = new Date();
    const where: Prisma.BlogPostWhereInput = {
      status: 'published',
      publishedAt: { lte: now },
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.authorId) where.authorId = query.authorId;

    if (query.tag) {
      where.id = {
        in: await getBlogIdsForTag(query.tag),
      };
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'publishedAt');
    const [items, totalItems] = await Promise.all([
      blogRepository.findMany({ where, skip, take, orderBy: orderBy as any }),
      blogRepository.count(where),
    ]);

    return {
      data: items.map(mapBlogPostToListItemDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async listAdmin(query: ListBlogPostsQuery): Promise<PaginatedResponse<BlogPostListItemDto>> {
    const where: Prisma.BlogPostWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.authorId) where.authorId = query.authorId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      blogRepository.findMany({ where, skip, take, orderBy: orderBy as any }),
      blogRepository.count(where),
    ]);

    return {
      data: items.map(mapBlogPostToListItemDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async getBySlug(slug: string, authorUsername?: string): Promise<BlogPostDto> {
    const post = authorUsername
      ? await blogRepository.findBySlugAndAuthor(authorUsername, slug)
      : await blogRepository.findBySlug(slug);

    if (!post) {
      throw new NotFoundError(`Blog post with slug '${slug}' not found`);
    }

    const tagNames = await blogRepository.getBlogPostTags(post.id);
    return mapBlogPostToDto(post, tagNames);
  },

  async getById(id: string): Promise<BlogPostDto> {
    const post = await blogRepository.findById(id);
    if (!post) {
      throw new NotFoundError(`Blog post '${id}' not found`);
    }

    const tagNames = await blogRepository.getBlogPostTags(post.id);
    return mapBlogPostToDto(post, tagNames);
  },

  async create(authorId: string, input: CreateBlogPostInput): Promise<BlogPostDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.title);
    const existing = await blogRepository.findBySlug(slug);
    if (existing && existing.authorId === authorId) {
      throw new ConflictError(`Blog post with slug '${slug}' already exists for this author`);
    }

    const readingTime = input.readingTimeMinutes ?? calculateReadingTime(input.content);

    const created = await blogRepository.create(
      {
        title: input.title,
        slug,
        content: input.content,
        excerpt: input.excerpt ?? null,
        readingTimeMinutes: readingTime,
        status: input.status as any,
        isFeatured: input.isFeatured ?? false,
        categoryId: input.categoryId ?? null,
        coverImageId: input.coverImageId ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        seoKeywords: input.seoKeywords ?? null,
        ogImageId: input.ogImageId ?? null,
        authorId,
        publishedAt: input.status === 'published' ? new Date() : null,
      },
      input.tagIds,
    );

    const tagNames = await blogRepository.getBlogPostTags(created.id);
    const dto = mapBlogPostToDto(created, tagNames);

    if (created.status === 'published') {
      setImmediate(async () => {
        try {
          if (input.notifySubscribers === false) return;

          if (input.notifySubscribers !== true) {
            const setting = await siteSettingRepository.findByKey('email_notifications_auto_broadcast_blog');
            if (setting?.value === 'false') return;
          }

          await contentBroadcastService.broadcastPublishedContent({
            contentType: 'blog',
            title: created.title,
            slug: created.slug,
            excerpt: created.excerpt,
            readingTimeMinutes: created.readingTimeMinutes,
            categoryName: created.category?.name || null,
            coverImageUrl: created.coverImage?.url || null,
          });
        } catch (err) {
          logger.error({ err, blogId: created.id }, 'Failed to broadcast published blog post');
        }
      });
    }

    return dto;
  },

  async update(
    id: string,
    input: UpdateBlogPostInput,
    adminAuthorId?: string,
  ): Promise<BlogPostDto> {
    const existing = await blogRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Blog post '${id}' not found`);
    }

    // Save snapshot in content_versions
    await saveContentVersion(
      'blog_post',
      id,
      existing as any,
      adminAuthorId,
      'Blog post updated via API',
    );

    const updateData: Prisma.BlogPostUncheckedUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.content !== undefined) {
      updateData.content = input.content;
      updateData.readingTimeMinutes =
        input.readingTimeMinutes ?? calculateReadingTime(input.content);
    } else if (input.readingTimeMinutes !== undefined) {
      updateData.readingTimeMinutes = input.readingTimeMinutes;
    }
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt || null;
    if (input.status !== undefined) {
      updateData.status = input.status as any;
      if (input.status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId || null;
    if (input.coverImageId !== undefined) updateData.coverImageId = input.coverImageId || null;
    if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined)
      updateData.seoDescription = input.seoDescription || null;
    if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords || null;
    if (input.ogImageId !== undefined) updateData.ogImageId = input.ogImageId || null;

    const updated = await blogRepository.update(id, updateData, input.tagIds);
    const tagNames = await blogRepository.getBlogPostTags(updated.id);
    const dto = mapBlogPostToDto(updated, tagNames);

    // If transitioned from non-published to published
    if (existing.status !== 'published' && updated.status === 'published') {
      setImmediate(async () => {
        try {
          if (input.notifySubscribers === false) return;

          if (input.notifySubscribers !== true) {
            const setting = await siteSettingRepository.findByKey('email_notifications_auto_broadcast_blog');
            if (setting?.value === 'false') return;
          }

          await contentBroadcastService.broadcastPublishedContent({
            contentType: 'blog',
            title: updated.title,
            slug: updated.slug,
            excerpt: updated.excerpt,
            readingTimeMinutes: updated.readingTimeMinutes,
            categoryName: updated.category?.name || null,
            coverImageUrl: updated.coverImage?.url || null,
          });
        } catch (err) {
          logger.error({ err, blogId: updated.id }, 'Failed to broadcast newly published blog post');
        }
      });
    }

    return dto;
  },

  async delete(id: string): Promise<void> {
    await blogService.getById(id);
    await blogRepository.delete(id);
  },

  async updateStatus(id: string, status: any): Promise<BlogPostDto> {
    await blogService.getById(id);
    const updated = await blogRepository.updateStatus(id, status);
    const tagNames = await blogRepository.getBlogPostTags(updated.id);
    return mapBlogPostToDto(updated, tagNames);
  },

  async getVersions(id: string): Promise<ContentVersionDto[]> {
    await blogService.getById(id);
    const versions = await blogRepository.findVersions(id);
    return versions.map(mapContentVersionToDto);
  },

  async restoreVersion(id: string, version: number, adminAuthorId?: string): Promise<BlogPostDto> {
    const versionRecord = await blogRepository.findVersion(id, version);
    if (!versionRecord) {
      throw new NotFoundError(`Version ${version} for blog post '${id}' not found`);
    }

    const snapshot = versionRecord.snapshot as Record<string, unknown>;
    const updateInput: UpdateBlogPostInput = {
      title: snapshot.title as string,
      content: snapshot.content as string,
      excerpt: snapshot.excerpt as string | undefined,
      readingTimeMinutes: snapshot.readingTimeMinutes as number | undefined,
      seoTitle: snapshot.seoTitle as string | undefined,
      seoDescription: snapshot.seoDescription as string | undefined,
      seoKeywords: snapshot.seoKeywords as string | undefined,
    };

    return blogService.update(id, updateInput, adminAuthorId);
  },
};

/** Helper to find blog post IDs matching a tag slug or name. */
async function getBlogIdsForTag(tagNameOrSlug: string): Promise<string[]> {
  const { prisma } = await import('@/config/prisma');
  const entityTags = await prisma.entityTag.findMany({
    where: {
      entityType: 'blog_post',
      tag: {
        OR: [{ name: { equals: tagNameOrSlug, mode: 'insensitive' } }, { slug: tagNameOrSlug }],
      },
    },
    select: { entityId: true },
  });
  return entityTags.map((et) => et.entityId);
}
