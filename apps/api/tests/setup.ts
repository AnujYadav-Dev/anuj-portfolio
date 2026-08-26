import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const localEnv = path.resolve(process.cwd(), '.env');
const apiEnv = path.resolve(process.cwd(), 'apps/api/.env');
if (fs.existsSync(apiEnv)) {
  dotenv.config({ path: apiEnv });
} else if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}

process.env.NODE_ENV = 'test';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long!';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-at-least-32-characters-long!';
}
