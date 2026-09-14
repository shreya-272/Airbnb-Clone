import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Fetch all listings
 * @route   GET /api/listings
 * @access  Public
 */
export const getAllListings = asyncHandler(async (req, res, next) => {
  const listings = await Listing.find();
  return res.status(200).json({
    success: true,
    count: listings.length,
    data: listings,
  });
});

/**
 * @desc    Fetch single listing by its MongoDB ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1. Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid listing ID format: "${id}". Must be a 24-character hexadecimal string.`, 400);
  }

  // 2. Fetch document by ID
  const listing = await Listing.findById(id);

  // 3. Handle Not Found case
  if (!listing) {
    throw new AppError(`Listing not found with ID: ${id}`, 404);
  }

  // 4. Return listing JSON
  return res.status(200).json({
    success: true,
    data: listing,
  });
});

export default {
  getAllListings,
  getListingById,
};
