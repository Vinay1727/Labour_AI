import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
export default router;
