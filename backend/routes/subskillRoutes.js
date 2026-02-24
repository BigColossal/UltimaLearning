import express from 'express';
import {
  getSubskills,
  getSubskillById,
  createSubskill,
  updateSubskill,
  addXP,
  deleteSubskill,
} from '../controllers/subskillController.js';

const router = express.Router();

router.get('/domain/:domainId', getSubskills);
router.get('/:id', getSubskillById);
router.post('/domain/:domainId', createSubskill);
router.put('/:id', updateSubskill);
router.patch('/:id/xp', addXP);
router.delete('/:id', deleteSubskill);

export default router;
