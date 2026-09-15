import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMessages, sendMessage, markMessagesRead } from '../controllers/messageController.js';

const router = express.Router();
router.use(protect);
router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/messages/read', markMessagesRead);
export default router;