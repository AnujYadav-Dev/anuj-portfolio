import { Router } from 'express';
import { skillController } from '@/controllers/skill.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import { reorderSchema, upsertSkillSchema, uuidParamSchema } from '@portfolio/shared';

const router = Router();

// Reorder routes (must precede /:id)
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderSkills,
);
router.put(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderSkills,
);
router.patch(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderSkills,
);
router.put(
  '/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderSkills,
);

// Admin collection routes (must precede /:id)
router.get('/admin/all', authenticateAdmin, skillController.listSkillsAdmin);
router.get(
  '/admin/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  skillController.getSkillById,
);

// Public list
router.get('/', skillController.listSkillsPublic);

// Generic ID routes
router.get('/:id', validateParams(uuidParamSchema), skillController.getSkillById);
router.post('/', authenticateAdmin, validateBody(upsertSkillSchema), skillController.createSkill);
router.put(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  validateBody(upsertSkillSchema.partial()),
  skillController.updateSkill,
);
router.delete(
  '/:id',
  authenticateAdmin,
  validateParams(uuidParamSchema),
  skillController.deleteSkill,
);

export { router as skillRouter };
