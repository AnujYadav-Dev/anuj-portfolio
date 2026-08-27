import { researchRepository } from '@/repositories/research.repository';
import { siteSettingRepository } from '@/repositories/siteSetting.repository';
import { contentBroadcastService } from '@/services/contentBroadcast.service';
import { logger } from '@/config/logger';
import { mapResearchPaperToDto, mapResearchPaperToListItemDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { slugify } from '@/utils/slug';
import { NotFoundError, ConflictError } from '@/utils/errors';
import type {
  CreateResearchPaperInput,
  ListResearchPapersQuery,
  PaginatedResponse,
  ResearchPaperDto,
  ResearchPaperListItemDto,
  UpdateResearchPaperInput,
} from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const researchService = {
  async listPublished(
    query: ListResearchPapersQuery,
  ): Promise<PaginatedResponse<ResearchPaperListItemDto>> {
    const now = new Date();
    const where: Prisma.ResearchPaperWhereInput = {
      status: 'published',
      publishedAt: { lte: now },
    };

    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.authorId) where.authorId = query.authorId;

    if (query.tag) {
      where.id = {
        in: await getResearchIdsForTag(query.tag),
      };
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'publishedAt');
    const [items, totalItems] = await Promise.all([
      researchRepository.findMany({ where, skip, take, orderBy: orderBy as any }),
      researchRepository.count(where),
    ]);

    return {
      data: items.map(mapResearchPaperToListItemDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async listAdmin(
    query: ListResearchPapersQuery,
  ): Promise<PaginatedResponse<ResearchPaperListItemDto>> {
    const where: Prisma.ResearchPaperWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.authorId) where.authorId = query.authorId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { abstract: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      researchRepository.findMany({ where, skip, take, orderBy: orderBy as any }),
      researchRepository.count(where),
    ]);

    return {
      data: items.map(mapResearchPaperToListItemDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async getBySlug(slug: string, authorUsername?: string): Promise<ResearchPaperDto> {
    const paper = authorUsername
      ? await researchRepository.findBySlugAndAuthor(authorUsername, slug)
      : await researchRepository.findBySlug(slug);

    if (!paper) {
      throw new NotFoundError(`Research paper with slug '${slug}' not found`);
    }

    const tagNames = await researchRepository.getResearchTags(paper.id);
    return mapResearchPaperToDto(paper, tagNames);
  },

  async getById(id: string): Promise<ResearchPaperDto> {
    const paper = await researchRepository.findById(id);
    if (!paper) {
      throw new NotFoundError(`Research paper '${id}' not found`);
    }

    const tagNames = await researchRepository.getResearchTags(paper.id);
    return mapResearchPaperToDto(paper, tagNames);
  },

  async create(authorId: string, input: CreateResearchPaperInput): Promise<ResearchPaperDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.title);
    const existing = await researchRepository.findBySlug(slug);
    if (existing && existing.authorId === authorId) {
      throw new ConflictError(`Research paper with slug '${slug}' already exists for this author`);
    }

    const created = await researchRepository.create(
      {
        title: input.title,
        slug,
        abstract: input.abstract ?? null,
        content: input.content ?? null,
        doi: input.doi ?? null,
        publicationUrl: input.publicationUrl ?? null,
        publicationName: input.publicationName ?? null,
        publicationDate: input.publicationDate ? new Date(input.publicationDate) : null,
        status: input.status as any,
        isFeatured: input.isFeatured ?? false,
        pdfId: input.pdfId ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        seoKeywords: input.seoKeywords ?? null,
        ogImageId: input.ogImageId ?? null,
        authorId,
        publishedAt: input.status === 'published' ? new Date() : null,
      },
      input.tagIds,
    );

    const tagNames = await researchRepository.getResearchTags(created.id);
    const dto = mapResearchPaperToDto(created, tagNames);

    if (created.status === 'published') {
      setImmediate(async () => {
        try {
          if (input.notifySubscribers === false) return;

          if (input.notifySubscribers !== true) {
            const setting = await siteSettingRepository.findByKey('email_notifications_auto_broadcast_research');
            if (setting?.value === 'false') return;
          }

          await contentBroadcastService.broadcastPublishedContent({
            contentType: 'research',
            title: created.title,
            slug: created.slug,
            excerpt: created.abstract,
            categoryName: created.publicationName || null,
            coverImageUrl: created.ogImage?.url || null,
          });
        } catch (err) {
          logger.error({ err, researchId: created.id }, 'Failed to broadcast published research paper');
        }
      });
    }

    return dto;
  },

  async update(id: string, input: UpdateResearchPaperInput): Promise<ResearchPaperDto> {
    const existing = await researchService.getById(id);

    const updateData: Prisma.ResearchPaperUncheckedUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.abstract !== undefined) updateData.abstract = input.abstract || null;
    if (input.content !== undefined) updateData.content = input.content || null;
    if (input.doi !== undefined) updateData.doi = input.doi || null;
    if (input.publicationUrl !== undefined)
      updateData.publicationUrl = input.publicationUrl || null;
    if (input.publicationName !== undefined)
      updateData.publicationName = input.publicationName || null;
    if (input.publicationDate !== undefined) {
      updateData.publicationDate = input.publicationDate ? new Date(input.publicationDate) : null;
    }
    if (input.status !== undefined) {
      updateData.status = input.status as any;
      if (input.status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.pdfId !== undefined) updateData.pdfId = input.pdfId || null;
    if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined)
      updateData.seoDescription = input.seoDescription || null;
    if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords || null;
    if (input.ogImageId !== undefined) updateData.ogImageId = input.ogImageId || null;

    const updated = await researchRepository.update(id, updateData, input.tagIds);
    const tagNames = await researchRepository.getResearchTags(updated.id);
    const dto = mapResearchPaperToDto(updated, tagNames);

    if (existing.status !== 'published' && updated.status === 'published') {
      setImmediate(async () => {
        try {
          if (input.notifySubscribers === false) return;

          if (input.notifySubscribers !== true) {
            const setting = await siteSettingRepository.findByKey('email_notifications_auto_broadcast_research');
            if (setting?.value === 'false') return;
          }

          await contentBroadcastService.broadcastPublishedContent({
            contentType: 'research',
            title: updated.title,
            slug: updated.slug,
            excerpt: updated.abstract,
            categoryName: updated.publicationName || null,
            coverImageUrl: updated.ogImage?.url || null,
          });
        } catch (err) {
          logger.error({ err, researchId: updated.id }, 'Failed to broadcast newly published research paper');
        }
      });
    }

    return dto;
  },

  async delete(id: string): Promise<void> {
    await researchService.getById(id);
    await researchRepository.delete(id);
  },

  async updateStatus(id: string, status: any): Promise<ResearchPaperDto> {
    await researchService.getById(id);
    const updated = await researchRepository.updateStatus(id, status);
    const tagNames = await researchRepository.getResearchTags(updated.id);
    return mapResearchPaperToDto(updated, tagNames);
  },
};

/** Helper to find research paper IDs matching a tag slug or name. */
async function getResearchIdsForTag(tagNameOrSlug: string): Promise<string[]> {
  const { prisma } = await import('@/config/prisma');
  const entityTags = await prisma.entityTag.findMany({
    where: {
      entityType: 'research_paper',
      tag: {
        OR: [{ name: { equals: tagNameOrSlug, mode: 'insensitive' } }, { slug: tagNameOrSlug }],
      },
    },
    select: { entityId: true },
  });
  return entityTags.map((et) => et.entityId);
}
