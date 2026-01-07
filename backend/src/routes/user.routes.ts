import express from 'express';
import { getProfile, updateProfile, searchLabours, getSkillInsights, getLabourDetails } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/search-labours', protect, searchLabours);
router.get('/skill-insights', protect, getSkillInsights);
router.get('/labour-details/:id', protect, getLabourDetails);

export default router;
