import { v2 as cloudinary } from 'cloudinary';
import { config } from '@/config/env';
import type { StorageAdapter, StorageResult } from '@/storage/storage.adapter';

export class CloudinaryStorageAdapter implements StorageAdapter {
  constructor() {
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async save(buffer: Buffer, filename: string, mimeType: string): Promise<StorageResult> {
    const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';
    const folder = 'portfolio';

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: filename.replace(/\.[^.]+$/, ''),
            resource_type: resourceType,
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error ?? new Error('Cloudinary upload failed'));
              return;
            }
            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          },
        );

        uploadStream.end(buffer);
      },
    );

    return {
      url: result.secure_url,
      storedName: result.public_id,
    };
  }
}
