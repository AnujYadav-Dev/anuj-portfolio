import { pageRepository } from '@/repositories/page.repository';
import { mapPageToDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { slugify } from '@/utils/slug';
import { NotFoundError, ConflictError } from '@/utils/errors';
import type {
  CreatePageInput,
  ListPagesQuery,
  PageDto,
  PaginatedResponse,
  UpdatePageInput,
} from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const pageService = {
  async listPublic(query: ListPagesQuery): Promise<PaginatedResponse<PageDto>> {
    const now = new Date();
    const where: Prisma.PageWhereInput = {
      status: 'published',
      publishedAt: { lte: now },
      isNavVisible: true,
    };

    const { skip, take, orderBy } = getPrismaPagination(query, 'sortOrder');
    const [items, totalItems] = await Promise.all([
      pageRepository.findMany({ where, skip, take, orderBy: orderBy as any }, false),
      pageRepository.count(where),
    ]);

    return {
      data: items.map(mapPageToDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async listAdmin(query: ListPagesQuery): Promise<PaginatedResponse<PageDto>> {
    const where: Prisma.PageWhereInput = {};
    if (query.status) where.status = query.status as any;

    const { skip, take, orderBy } = getPrismaPagination(query, 'sortOrder');
    const [items, totalItems] = await Promise.all([
      pageRepository.findMany({ where, skip, take, orderBy: orderBy as any }, true),
      pageRepository.count(where),
    ]);

    return {
      data: items.map(mapPageToDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async getBySlug(slug: string, isAdmin = false): Promise<PageDto> {
    const page = await pageRepository.findBySlug(slug, isAdmin);
    if (!page) {
      throw new NotFoundError(`Page with slug '${slug}' not found`);
    }
    if (!isAdmin && page.status !== 'published') {
      throw new NotFoundError(`Page with slug '${slug}' not found`);
    }
    return mapPageToDto(page);
  },

  async getById(id: string): Promise<PageDto> {
    const page = await pageRepository.findById(id, true);
    if (!page) {
      throw new NotFoundError(`Page '${id}' not found`);
    }
    return mapPageToDto(page);
  },

  async create(input: CreatePageInput): Promise<PageDto> {
    const slug = slugify(input.slug || input.title);
    const existing = await pageRepository.findBySlug(slug, true);
    if (existing) {
      throw new ConflictError(`Page with slug '${slug}' already exists`);
    }

    const created = await pageRepository.create({
      title: input.title,
      slug,
      content: input.content ?? null,
      status: input.status as any,
      isNavVisible: input.isNavVisible ?? false,
      sortOrder: input.sortOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoKeywords: input.seoKeywords ?? null,
      ogImageId: input.ogImageId ?? null,
      publishedAt: input.status === 'published' ? new Date() : null,
    });

    return mapPageToDto(created);
  },

  async update(id: string, input: UpdatePageInput): Promise<PageDto> {
    await pageService.getById(id);

    const updateData: Prisma.PageUncheckedUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.content !== undefined) updateData.content = input.content || null;
    if (input.status !== undefined) updateData.status = input.status as any;
    if (input.isNavVisible !== undefined) updateData.isNavVisible = input.isNavVisible;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined)
      updateData.seoDescription = input.seoDescription || null;
    if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords || null;
    if (input.ogImageId !== undefined) updateData.ogImageId = input.ogImageId || null;

    const updated = await pageRepository.update(id, updateData);
    return mapPageToDto(updated);
  },

  async delete(id: string): Promise<void> {
    await pageService.getById(id);
    await pageRepository.delete(id);
  },
};
