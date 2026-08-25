import { prisma } from '@/config/prisma';

const authorInclude = { avatar: { select: { url: true } } };

export const authorRepository = {
  async findByEmail(email: string) {
    return prisma.author.findUnique({
      where: { email },
      include: authorInclude,
    });
  },

  async findByIdWithAvatar(id: string) {
    return prisma.author.findUnique({
      where: { id },
      include: authorInclude,
    });
  },

  async findAdminEmails(): Promise<string[]> {
    const admins = await prisma.author.findMany({
      where: { isAdmin: true, isEnabled: true },
      select: { email: true },
    });
    return admins.map((admin) => admin.email);
  },

  async update(id: string, data: {
    displayName?: string;
    username?: string;
    email?: string;
    bio?: string | null;
    avatarId?: string | null;
  }) {
    return prisma.author.update({
      where: { id },
      data,
      include: authorInclude,
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.author.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
