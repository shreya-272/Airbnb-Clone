import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Fetch all listings
 * @route   GET /api/listings
 * @access  Public
 */
export const getAllListings = asyncHandler(async (req, res, next) => {
  const { category, search } = req.query;
  const filter = { 'location.country': 'India' };

  if (category && category.toLowerCase() !== 'all') {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { 'location.city': searchRegex },
      { 'location.country': searchRegex },
      { 'location.state': searchRegex },
      { description: searchRegex },
    ];
  }

  const listings = await Listing.find(filter).sort({ createdAt: -1 });
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
  const listing = await Listing.findOne({ _id: id, 'location.country': 'India' });

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
