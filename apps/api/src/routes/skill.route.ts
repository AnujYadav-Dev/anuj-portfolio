import { Router } from 'express';
import { skillController } from '@/controllers/skill.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { reorderSchema, upsertSkillSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderSkills),
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderSkills),
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderSkills),
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  asyncHandler(skillController.reorderSkills),
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, asyncHandler(skillController.listSkillsAdmin));
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(skillController.getSkillById),
);

// Public list
router.get('/', asyncHandler(skillController.listSkillsPublic));

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), asyncHandler(skillController.getSkillById));
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertSkillSchema),
  asyncHandler(skillController.createSkill),
);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertSkillSchema.partial()),
  asyncHandler(skillController.updateSkill),
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  asyncHandler(skillController.deleteSkill),
);

export { router as skillRouter };
