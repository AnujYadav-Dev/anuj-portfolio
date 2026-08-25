import { Router } from 'express';
import multer from 'multer';
import { mediaController } from '@/controllers/media.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { MAX_UPLOAD_BYTES } from '@/config/constants';
import { ValidationError } from '@/utils/errors';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, _file, callback) => {
    callback(null, true);
  },
});

router.post(
  '/',
  authenticateAdmin,
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          next(
            new ValidationError('File too large', {
              file: [`Maximum file size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`],
            }),
          );
          return;
        }
        next(new ValidationError('File upload failed', { file: [err.message] }));
        return;
      }
      if (err) {
        next(err);
        return;
      }
      next();
    });
  },
  asyncHandler(mediaController.upload),
);

export { router as mediaRouter };
