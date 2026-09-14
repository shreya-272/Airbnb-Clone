import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';

/**
 * @desc    Create a new booking with date validation and server-side price recalculation
 * @route   POST /api/bookings
 * @access  Public
 */
export const createBooking = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    // 1. Validate required fields
    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'listingId, checkIn, and checkOut dates are required',
      });
    }

    // 2. Validate listingId format and existence
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid listingId format',
        listingId,
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: `Listing not found with ID: ${listingId}`,
      });
    }

    // 3. Parse and validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format provided for checkIn or checkOut',
      });
    }

    // Validate no past dates (normalize to start of day UTC)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDay = new Date(checkInDate);
    checkInDay.setHours(0, 0, 0, 0);

    if (checkInDay < today) {
      return res.status(400).json({
        success: false,
        error: 'Check-in date cannot be in the past',
        checkIn: checkInDate.toISOString().split('T')[0],
      });
    }

    // Validate checkout is strictly after checkin
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Checkout date must be after check-in date',
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
      });
    }

    // 4. Validate and structure guests
    const guestData = {
      adults: typeof guests === 'object' && guests?.adults !== undefined ? Number(guests.adults) : 1,
      children: typeof guests === 'object' && guests?.children !== undefined ? Number(guests.children) : 0,
      infants: typeof guests === 'object' && guests?.infants !== undefined ? Number(guests.infants) : 0,
    };
    guestData.total = guestData.adults + guestData.children;

    if (guestData.total > listing.guestCapacity) {
      return res.status(400).json({
        success: false,
        error: `Guest count (${guestData.total}) exceeds maximum capacity of ${listing.guestCapacity}`,
      });
    }

    // 5. Server-side authoritative price recalculation
    const nightlyRate = listing.pricePerNight;
    const basePrice = nightlyRate * nights;
    const cleaningFee = listing.cleaningFee !== undefined ? listing.cleaningFee : 150;
    const serviceFee = listing.serviceFee !== undefined ? listing.serviceFee : Math.round(basePrice * 0.142);
    const taxes = Math.round((basePrice + cleaningFee) * 0.085);
    const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

    // 6. Save booking to MongoDB
    const booking = await Booking.create({
      listingId: listing._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestData,
      totalPrice,
      status: 'pending',
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
        listingId: booking.listingId,
        listingTitle: listing.title,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        nights,
        guests: guestData,
        status: booking.status,
        pricing: {
          nightlyRate,
          nights,
          basePrice,
          cleaningFee,
          serviceFee,
          taxes,
          totalPrice,
        },
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error(`[bookingController] Error creating booking: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while processing reservation request',
      message: error.message,
    });
  }
};

/**
 * @desc    Fetch bookings list
 * @route   GET /api/bookings
 * @access  Public
 */
export const getBookings = async (req, res) => {
  try {
    const { listingId } = req.query;
    const filter = listingId ? { listingId } : {};

    const bookings = await Booking.find(filter)
      .populate('listingId', 'title location pricePerNight images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(`[bookingController] Error fetching bookings: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching bookings',
      message: error.message,
    });
  }
};

export default {
  createBooking,
  getBookings,
};
