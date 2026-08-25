import { prisma } from '@/config/prisma';
import type { Prisma } from '@prisma/client';

export const tagRepository = {
  async findAll() {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { entityTags: true },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt,
      count: t._count.entityTags,
    }));
  },

  async findById(id: string) {
    return prisma.tag.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return prisma.tag.findUnique({ where: { slug } });
  },

  async findByName(name: string) {
    return prisma.tag.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  },

  async create(name: string, slug: string) {
    return prisma.tag.create({
      data: { name, slug },
    });
  },

  async update(id: string, data: Prisma.TagUpdateInput) {
    return prisma.tag.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.tag.delete({ where: { id } });
  },
};
