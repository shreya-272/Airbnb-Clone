import mongoose from 'mongoose';
import Listing from '../models/Listing.js';

/**
 * @desc    Fetch all listings
 * @route   GET /api/listings
 * @access  Public
 */
export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error(`[listingController] Error fetching listings: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching listings',
      message: error.message,
    });
  }
};

/**
 * @desc    Fetch single listing by its MongoDB ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid listing ID format. ID must be a 24-character hexadecimal string.',
        id,
      });
    }

    // 2. Fetch document by ID
    const listing = await Listing.findById(id);

    // 3. Handle Not Found case
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: `Listing not found with ID: ${id}`,
        id,
      });
    }

    // 4. Return listing JSON
    return res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error(`[listingController] Error fetching listing by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching listing',
      message: error.message,
    });
  }
};

export default {
  getAllListings,
  getListingById,
};
