import { z } from 'zod';
import dotenv from 'dotenv';

import path from 'node:path';
import fs from 'node:fs';

const localEnv = path.resolve(process.cwd(), '.env');
const apiEnv = path.resolve(process.cwd(), 'apps/api/.env');
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else if (fs.existsSync(apiEnv)) {
  dotenv.config({ path: apiEnv });
} else {
  dotenv.config();
}

const optionalString = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.string().optional(),
);

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PORT: z.preprocess((value) => value ?? process.env.API_PORT, z.coerce.number().default(3001)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary']).default('local'),
  UPLOAD_DIR: z.string().default('uploads'),
  API_PUBLIC_URL: z.string().default('http://localhost:3001'),
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM: optionalString,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
});

export const config = envSchema.parse(process.env);

export function isSmtpConfigured(): boolean {
  return Boolean(config.SMTP_HOST && config.SMTP_FROM);
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET,
  );
}
