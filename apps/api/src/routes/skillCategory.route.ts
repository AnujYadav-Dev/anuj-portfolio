import { Router } from 'express';
import { skillController } from '@/controllers/skill.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertSkillCategorySchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', skillController.listCategoriesPublic);
router.get('/:id', validateParams(uuidParamSchema), skillController.getCategoryById);

// Admin
router.get('/admin/all', authenticateAdmin, skillController.listCategoriesAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertSkillCategorySchema),
  skillController.createCategory,
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertSkillCategorySchema.partial()),
  skillController.updateCategory,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  skillController.deleteCategory,
);
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderCategories,
);

export { router as skillCategoryRouter };
