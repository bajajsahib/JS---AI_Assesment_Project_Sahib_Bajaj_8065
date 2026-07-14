import { Router } from 'express';
import { findAllUsers } from '../repositories/userRepository.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(findAllUsers());
});

export default router;
