import express from 'express';
import { requestOtp, verifyOtp, register, login } from '../controllers/auth.controller';

import { authValidators } from '../middleware/validate.middleware';

const router = express.Router();

router.post('/request-otp', authValidators.requestOtp, requestOtp);
router.post('/verify-otp', authValidators.verifyOtp, verifyOtp);
router.post('/register', authValidators.register, register);
router.post('/login', login);


export default router;
