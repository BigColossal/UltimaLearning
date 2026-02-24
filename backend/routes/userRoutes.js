import express from 'express';
import { getOrCreateUser, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getOrCreateUser);
router.get('/:id', getUserById);

export default router;
