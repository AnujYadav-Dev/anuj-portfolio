import { projectRepository } from '@/repositories/project.repository';
import { mapProjectToDto, mapProjectToListItemDto } from '@/utils/mappers';
import { buildPagination, getPrismaPagination } from '@/utils/pagination';
import { saveContentVersion } from '@/utils/versioning';
import { slugify } from '@/utils/slug';
import { NotFoundError, ConflictError } from '@/utils/errors';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  PaginatedResponse,
  ProjectDto,
  ProjectListItemDto,
  UpdateProjectInput,
} from '@portfolio/shared';
import type { Prisma } from '@prisma/client';

export const projectService = {
  async listPublished(query: ListProjectsQuery): Promise<PaginatedResponse<ProjectListItemDto>> {
    const now = new Date();
    const where: Prisma.ProjectWhereInput = {
      status: 'published',
      publishedAt: { lte: now },
    };

    if (query.projectType) where.projectType = query.projectType as any;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.authorId) where.authorId = query.authorId;

    if (query.tag) {
      where.id = {
        in: await getProjectIdsForTag(query.tag),
      };
    }

    const { skip, take, orderBy } = getPrismaPagination(query, 'publishedAt');
    const [items, totalItems] = await Promise.all([
      projectRepository.findMany({ where, skip, take, orderBy: orderBy as any }),
      projectRepository.count(where),
    ]);

    return {
      data: items.map(mapProjectToListItemDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async listAdmin(query: ListProjectsQuery): Promise<PaginatedResponse<ProjectListItemDto>> {
    const where: Prisma.ProjectWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.projectType) where.projectType = query.projectType as any;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.authorId) where.authorId = query.authorId;

    const { skip, take, orderBy } = getPrismaPagination(query, 'createdAt');
    const [items, totalItems] = await Promise.all([
      projectRepository.findMany({ where, skip, take, orderBy: orderBy as any }),
      projectRepository.count(where),
    ]);

    return {
      data: items.map(mapProjectToListItemDto),
      pagination: buildPagination(query.page, query.pageSize, totalItems),
    };
  },

  async getBySlug(slug: string, authorUsername?: string): Promise<ProjectDto> {
    const project = authorUsername
      ? await projectRepository.findBySlugAndAuthor(authorUsername, slug)
      : await projectRepository.findBySlug(slug);

    if (!project) {
      throw new NotFoundError(`Project with slug '${slug}' not found`);
    }

    const tagNames = await projectRepository.getProjectTags(project.id);
    return mapProjectToDto(project, tagNames);
  },

  async getById(id: string): Promise<ProjectDto> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError(`Project '${id}' not found`);
    }

    const tagNames = await projectRepository.getProjectTags(project.id);
    return mapProjectToDto(project, tagNames);
  },

  async create(authorId: string, input: CreateProjectInput): Promise<ProjectDto> {
    const slug = input.slug ? slugify(input.slug) : slugify(input.title);
    const existing = await projectRepository.findBySlug(slug);
    if (existing && existing.authorId === authorId) {
      throw new ConflictError(`Project with slug '${slug}' already exists for this author`);
    }

    const created = await projectRepository.create(
      {
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        content: input.content ?? null,
        technologies: input.technologies ?? [],
        githubUrl: input.githubUrl ?? null,
        liveUrl: input.liveUrl ?? null,
        projectType: input.projectType as any,
        projectStatus: input.projectStatus as any,
        status: input.status as any,
        isFeatured: input.isFeatured ?? false,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
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

    const tagNames = await projectRepository.getProjectTags(created.id);
    return mapProjectToDto(created, tagNames);
  },

  async update(id: string, input: UpdateProjectInput, adminAuthorId?: string): Promise<ProjectDto> {
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Project '${id}' not found`);
    }

    // Save version snapshot before update
    await saveContentVersion(
      'project',
      id,
      existing as any,
      adminAuthorId,
      'Project updated via API',
    );

    const updateData: Prisma.ProjectUncheckedUpdateInput = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.shortDescription !== undefined) updateData.shortDescription = input.shortDescription;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.technologies !== undefined) updateData.technologies = input.technologies;
    if (input.githubUrl !== undefined) updateData.githubUrl = input.githubUrl || null;
    if (input.liveUrl !== undefined) updateData.liveUrl = input.liveUrl || null;
    if (input.projectType !== undefined) updateData.projectType = input.projectType as any;
    if (input.projectStatus !== undefined) updateData.projectStatus = input.projectStatus as any;
    if (input.status !== undefined) {
      updateData.status = input.status as any;
      if (input.status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.startDate !== undefined)
      updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.endDate !== undefined)
      updateData.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId || null;
    if (input.coverImageId !== undefined) updateData.coverImageId = input.coverImageId || null;
    if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined)
      updateData.seoDescription = input.seoDescription || null;
    if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords || null;
    if (input.ogImageId !== undefined) updateData.ogImageId = input.ogImageId || null;

    const updated = await projectRepository.update(id, updateData, input.tagIds);
    const tagNames = await projectRepository.getProjectTags(updated.id);
    return mapProjectToDto(updated, tagNames);
  },

  async delete(id: string): Promise<void> {
    await projectService.getById(id);
    await projectRepository.delete(id);
  },

  async updateStatus(id: string, status: any): Promise<ProjectDto> {
    await projectService.getById(id);
    const updated = await projectRepository.updateStatus(id, status);
    const tagNames = await projectRepository.getProjectTags(updated.id);
    return mapProjectToDto(updated, tagNames);
  },

  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    await projectRepository.reorder(items);
  },
};

/** Helper to find project IDs matching a tag slug or name. */
async function getProjectIdsForTag(tagNameOrSlug: string): Promise<string[]> {
  const { prisma } = await import('@/config/prisma');
  const entityTags = await prisma.entityTag.findMany({
    where: {
      entityType: 'project',
      tag: {
        OR: [{ name: { equals: tagNameOrSlug, mode: 'insensitive' } }, { slug: tagNameOrSlug }],
      },
    },
    select: { entityId: true },
  });
  return entityTags.map((et) => et.entityId);
}
