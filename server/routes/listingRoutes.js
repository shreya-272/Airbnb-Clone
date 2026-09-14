import express from 'express';
import { getListingById, getAllListings } from '../controllers/listingController.js';
import { getReviewsForListing, addReviewForListing } from '../controllers/reviewController.js';

const router = express.Router();

// GET /api/listings
router.get('/listings', getAllListings);

// GET /api/listings/:id
router.get('/listings/:id', getListingById);

// GET /api/listings/:id/reviews - Fetch all reviews for a listing
router.get('/listings/:id/reviews', getReviewsForListing);

// POST /api/listings/:id/reviews - Add a review and update listing rating
router.post('/listings/:id/reviews', addReviewForListing);

export default router;
