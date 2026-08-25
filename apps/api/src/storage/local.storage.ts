import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { config } from '@/config/env';
import type { StorageAdapter, StorageResult } from '@/storage/storage.adapter';

export class LocalStorageAdapter implements StorageAdapter {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), config.UPLOAD_DIR);
  }

  async save(buffer: Buffer, filename: string, _mimeType: string): Promise<StorageResult> {
    await mkdir(this.uploadDir, { recursive: true });

    const filePath = path.join(this.uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `${config.API_PUBLIC_URL.replace(/\/$/, '')}/uploads/${filename}`;

    return { url, storedName: filename };
  }

  async delete(filenameOrUrl: string): Promise<void> {
    try {
      const filename = path.basename(filenameOrUrl);
      const filePath = path.join(this.uploadDir, filename);
      await unlink(filePath);
    } catch {
      // Ignore if file doesn't exist on disk
    }
  }
}
