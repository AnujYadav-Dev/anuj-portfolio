import { config, isCloudinaryConfigured } from '@/config/env';
import type { StorageAdapter } from '@/storage/storage.adapter';
import { LocalStorageAdapter } from '@/storage/local.storage';
import { CloudinaryStorageAdapter } from '@/storage/cloudinary.storage';
import { AppError } from '@/utils/errors';

let storageAdapter: StorageAdapter | null = null;

/** Return the configured storage adapter singleton. */
export function getStorageAdapter(): StorageAdapter {
  if (storageAdapter) {
    return storageAdapter;
  }

  if (config.STORAGE_PROVIDER === 'cloudinary') {
    if (!isCloudinaryConfigured()) {
      throw new AppError(
        'CONFIG_ERROR',
        'Cloudinary storage is selected but credentials are not configured',
        500,
      );
    }
    storageAdapter = new CloudinaryStorageAdapter();
    return storageAdapter;
  }

  storageAdapter = new LocalStorageAdapter();
  return storageAdapter;
}
