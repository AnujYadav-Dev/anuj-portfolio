import { Router } from 'express';
import { skillController } from '@/controllers/skill.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertSkillCategorySchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderCategories),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderCategories),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderCategories),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderCategories),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(skillController.listCategoriesAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(skillController.getCategoryById),
);

// Public list
router.get('/', asyncHandler(skillController.listCategoriesPublic));

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(skillController.getCategoryById));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertSkillCategorySchema),
  asyncHandler(skillController.createCategory),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertSkillCategorySchema.partial()),
  asyncHandler(skillController.updateCategory),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(skillController.deleteCategory),
);

export { router as skillCategoryRouter };
