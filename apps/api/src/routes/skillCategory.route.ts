import { Router } from 'express';
import { skillController } from '@/controllers/skill.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertSkillCategorySchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderCategories,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderCategories,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderCategories,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderCategories,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, skillController.listCategoriesAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  skillController.getCategoryById,
);

// Public list
router.get('/', skillController.listCategoriesPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), skillController.getCategoryById);
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

export { router as skillCategoryRouter };
