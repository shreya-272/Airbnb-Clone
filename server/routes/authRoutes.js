import express from 'express';
import { signup, login, getMe, loginDemo } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/demo', loginDemo);
router.get('/me', protect, getMe);

export default router;
