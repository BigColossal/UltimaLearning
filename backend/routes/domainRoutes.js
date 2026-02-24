import express from 'express';
import {
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
} from '../controllers/domainController.js';

const router = express.Router();

router.get('/skill/:skillId', getDomains);
router.get('/:id', getDomainById);
router.post('/skill/:skillId', createDomain);
router.put('/:id', updateDomain);
router.delete('/:id', deleteDomain);

export default router;
