import { Router } from 'express';
import { skillController } from '@/controllers/skill.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';
import { validateBody, validateParams } from '@/middleware/validate.middleware';
import {
  reorderSchema,
  upsertSkillSchema,
  uuidParamSchema,
} from '@portfolio/shared';

const router = Router();

// Public
router.get('/', skillController.listSkillsPublic);
router.get('/:id', validateParams(uuidParamSchema), skillController.getSkillById);

// Admin
router.get('/admin/all', authenticateAdmin, skillController.listSkillsAdmin);
router.post(
  '/',
  authenticateAdmin,
  validateBody(upsertSkillSchema),
  skillController.createSkill,
);
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
router.patch(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderSchema),
  skillController.reorderSkills,
);

export { router as skillRouter };
