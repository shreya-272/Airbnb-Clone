import express from 'express';
import { createBooking, getBookings } from '../controllers/bookingController.js';

const router = express.Router();

// POST /api/bookings - Create reservation with server-side validation & pricing
router.post('/bookings', createBooking);

// GET /api/bookings - Retrieve bookings
router.get('/bookings', getBookings);

export default router;
