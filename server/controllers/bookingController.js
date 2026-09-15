import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// Helper to extract user/session identifier
const getUserId = (req) => {
  return (
    req.headers['x-session-id'] ||
    req.headers['x-user-id'] ||
    req.body.userId ||
    req.body.sessionId ||
    req.query.userId ||
    req.query.sessionId ||
    'guest-user-default'
  );
};

/**
 * @desc    Create a new booking with date validation and server-side price recalculation
 * @route   POST /api/bookings
 * @access  Public
 */
export const createBooking = asyncHandler(async (req, res, next) => {
  const { listingId, checkIn, checkOut, guests } = req.body;
  const userId = getUserId(req);

  // 1. Validate required fields
  if (!listingId || !checkIn || !checkOut) {
    throw new AppError('listingId, checkIn, and checkOut dates are required', 400);
  }

  // 2. Validate listingId format and existence
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError(`Invalid listingId format: "${listingId}"`, 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError(`Listing not found with ID: ${listingId}`, 404);
  }

  // 3. Parse and validate dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new AppError('Invalid date format provided for checkIn or checkOut', 400);
  }

  // Validate no past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDay = new Date(checkInDate);
  checkInDay.setHours(0, 0, 0, 0);

  if (checkInDay < today) {
    throw new AppError('Check-in date cannot be in the past', 400);
  }

  checkInDate.setHours(12, 0, 0, 0);
  checkOutDate.setHours(12, 0, 0, 0);

  // Validate checkout is strictly after checkin
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new AppError('Checkout date must be after check-in date', 400);
  }

  const overlappingBooking = await Booking.findOne({
    listingId,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  if (overlappingBooking) {
    throw new AppError('These dates are no longer available. Please choose different dates.', 409);
  }

  // 4. Validate and structure guests
  const guestData = {
    adults: typeof guests === 'object' && guests?.adults !== undefined ? Number(guests.adults) : 1,
    children: typeof guests === 'object' && guests?.children !== undefined ? Number(guests.children) : 0,
    infants: typeof guests === 'object' && guests?.infants !== undefined ? Number(guests.infants) : 0,
  };
  guestData.total = guestData.adults + guestData.children;

  if (guestData.total > listing.guestCapacity) {
    throw new AppError(
      `Guest count (${guestData.total}) exceeds maximum capacity of ${listing.guestCapacity}`,
      400
    );
  }

  // 5. Server-side authoritative price recalculation (USD and INR)
  const nightlyRate = listing.pricePerNight;
  const basePrice = nightlyRate * nights;
  const cleaningFee = listing.cleaningFee !== undefined ? listing.cleaningFee : 150;
  const serviceFee = listing.serviceFee !== undefined ? listing.serviceFee : Math.round(basePrice * 0.142);
  const taxes = Math.round((basePrice + cleaningFee) * 0.085);
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

  const nightlyRateINR = listing.pricePerNightINR || Math.round(nightlyRate * 83);
  const basePriceINR = nightlyRateINR * nights;
  const cleaningFeeINR = listing.cleaningFeeINR !== undefined ? listing.cleaningFeeINR : Math.round(cleaningFee * 83);
  const serviceFeeINR = listing.serviceFeeINR !== undefined ? listing.serviceFeeINR : Math.round(basePriceINR * 0.142);
  const taxesINR = Math.round((basePriceINR + cleaningFeeINR) * 0.085);
  const totalPriceINR = basePriceINR + cleaningFeeINR + serviceFeeINR + taxesINR;

  // 6. Save booking to MongoDB
  const booking = await Booking.create({
    userId,
    listingId: listing._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guestData,
    totalPrice,
    totalPriceINR,
    status: 'confirmed',
    createdAt: new Date(),
  });

  const confirmationCode = `HM-${booking._id.toString().slice(-6).toUpperCase()}`;

  // 7. Return confirmation response
  return res.status(201).json({
    success: true,
    message: 'Reservation request submitted successfully',
    confirmationCode,
    booking: {
      _id: booking._id,
      userId: booking.userId,
      listingId: booking.listingId,
      listingTitle: listing.title,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      nights,
      guests: guestData,
      status: booking.status,
      pricing: {
        nightlyRate,
        nightlyRateINR,
        nights,
        basePrice,
        basePriceINR,
        cleaningFee,
        cleaningFeeINR,
        serviceFee,
        serviceFeeINR,
        taxes,
        taxesINR,
        totalPrice,
        totalPriceINR,
      },
      createdAt: booking.createdAt,
    },
  });
});

export const getAvailability = asyncHandler(async (req, res, next) => {
  const { listingId, from, to } = req.query;
  if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('A valid listingId is required', 400);
  }

  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date(start.getFullYear(), start.getMonth() + 3, start.getDate());
  const bookings = await Booking.find({
    listingId,
    status: { $in: ['pending', 'confirmed'] },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  }).select('checkIn checkOut -_id');

  return res.status(200).json({ success: true, data: bookings });
});

/**
 * @desc    Fetch bookings list (filtered by user or listing)
 * @route   GET /api/bookings
 * @access  Public
 */
export const getBookings = asyncHandler(async (req, res, next) => {
  const { listingId, all } = req.query;
  const userId = getUserId(req);
  const filter = {};

  if (listingId) {
    filter.listingId = listingId;
  } else if (!all && userId && userId !== 'all') {
    // By default, return bookings for current user/session or default guests
    filter.userId = { $in: [userId, 'guest-user-default'] };
  }

  const bookings = await Booking.find(filter)
    .populate('listingId', 'title location pricePerNight images category host')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

/**
 * @desc    Cancel a booking
 * @route   DELETE /api/bookings/:id
 * @access  Public
 */
export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid booking ID format: "${id}"`, 400);
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError(`Booking not found with ID: ${id}`, 404);
  }

  booking.status = 'cancelled';
  await booking.save();

  return res.status(200).json({
    success: true,
    message: 'Reservation cancelled successfully',
    data: booking,
  });
});

export default {
  createBooking,
  getAvailability,
  getBookings,
  cancelBooking,
};

