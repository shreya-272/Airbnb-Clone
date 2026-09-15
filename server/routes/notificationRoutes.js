import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, markNotificationsRead } from '../controllers/notificationController.js';

const router = express.Router();
router.use(protect);
router.get('/notifications', getNotifications);
router.post('/notifications/read', markNotificationsRead);
export default router;