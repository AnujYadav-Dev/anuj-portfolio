import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL || 'anujy7591@gmail.com';
  const username = process.env.ADMIN_SEED_USERNAME || 'anujy7591';
  const displayName = process.env.ADMIN_SEED_NAME || 'Anuj Yadav';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@123';

  console.log(`👤 Seeding admin user: ${email} (${username})...`);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const existingByEmail = await prisma.author.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    const updated = await prisma.author.update({
      where: { email },
      data: {
        passwordHash,
        isAdmin: true,
        isEnabled: true,
      },
    });
    console.log(`✅ Updated existing admin user (ID: ${updated.id}, Email: ${updated.email})`);
    return updated;
  }

  const existingByUsername = await prisma.author.findUnique({
    where: { username },
  });

  const finalUsername = existingByUsername ? `anuj_${Date.now()}` : username;

  const created = await prisma.author.create({
    data: {
      username: finalUsername,
      displayName,
      email,
      passwordHash,
      bio: 'Full-Stack Developer & Systems Architect passionate about crafting high-performance, elegant web applications and robust distributed systems.',
      isAdmin: true,
      isEnabled: true,
    },
  });

  console.log('✅ Successfully created admin user:');
  console.log(`   - ID: ${created.id}`);
  console.log(`   - Username: ${created.username}`);
  console.log(`   - Email: ${created.email}`);
  console.log(`   - Role: Admin (${created.isAdmin})`);
  console.log(`   - Status: Active (${created.isEnabled})`);
  console.log(`   - Default Password: ${password}`);

  return created;
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Failed to seed admin user:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
