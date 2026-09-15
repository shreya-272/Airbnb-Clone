import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getHostDashboard, createHostListing, updateHostListing } from '../controllers/hostController.js';

const router = express.Router();
router.use(protect);
router.get('/host/dashboard', getHostDashboard);
router.post('/host/listings', createHostListing);
router.patch('/host/listings/:id', updateHostListing);
export default router;