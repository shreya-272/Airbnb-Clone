import express from 'express';
import { createBooking, getBookings, cancelBooking, getAvailability } from '../controllers/bookingController.js';

const router = express.Router();

// POST /api/bookings - Create reservation with server-side validation & pricing
router.post('/bookings', createBooking);
router.get('/availability', getAvailability);

// GET /api/bookings - Retrieve bookings
router.get('/bookings', getBookings);

// DELETE /api/bookings/:id - Cancel a booking
router.delete('/bookings/:id', cancelBooking);

export default router;

