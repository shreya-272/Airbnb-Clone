import express from 'express';
import { getListingById, getAllListings } from '../controllers/listingController.js';

const router = express.Router();

// GET /api/listings
router.get('/listings', getAllListings);

// GET /api/listings/:id
router.get('/listings/:id', getListingById);

export default router;
