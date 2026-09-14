import mongoose from 'mongoose';
import Favorite from '../models/Favorite.js';
import Listing from '../models/Listing.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// Helper to extract userId or sessionId from request headers/body/query
const getIdentifier = (req) => {
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
 * @desc    Add a listing to favorites
 * @route   POST /api/favorites
 * @access  Public
 */
export const addFavorite = asyncHandler(async (req, res, next) => {
  const { listingId } = req.body;
  const userId = getIdentifier(req);

  if (!listingId) {
    throw new AppError('listingId is required in request body', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError(`Invalid listingId format: "${listingId}"`, 400);
  }

  // Verify listing exists
  const listingExists = await Listing.exists({ _id: listingId });
  if (!listingExists) {
    throw new AppError(`Listing not found with ID: ${listingId}`, 404);
  }

  // Upsert favorite to avoid duplicate key errors
  const favorite = await Favorite.findOneAndUpdate(
    { userId, listingId },
    { userId, listingId, createdAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({
    success: true,
    message: 'Listing saved to favorites',
    data: favorite,
  });
});

/**
 * @desc    Remove a listing from favorites
 * @route   DELETE /api/favorites/:listingId
 * @access  Public
 */
export const removeFavorite = asyncHandler(async (req, res, next) => {
  const { listingId } = req.params;
  const userId = getIdentifier(req);

  if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid or missing listingId parameter', 400);
  }

  const deleted = await Favorite.findOneAndDelete({ userId, listingId });

  return res.status(200).json({
    success: true,
    message: deleted ? 'Listing removed from favorites' : 'Listing was not in favorites',
    listingId,
    removed: Boolean(deleted),
  });
});

/**
 * @desc    Check favorite status or retrieve all saved favorites
 * @route   GET /api/favorites
 * @access  Public
 */
export const getFavorites = asyncHandler(async (req, res, next) => {
  const userId = getIdentifier(req);
  const { listingId } = req.query;

  // If checking a specific listingId
  if (listingId) {
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      throw new AppError(`Invalid listingId format: "${listingId}"`, 400);
    }

    const favorite = await Favorite.findOne({ userId, listingId });
    return res.status(200).json({
      success: true,
      isFavorited: Boolean(favorite),
      listingId,
      favorite: favorite || null,
    });
  }

  // Otherwise return all favorites for this user/session
  const favorites = await Favorite.find({ userId })
    .populate('listingId')
    .sort({ createdAt: -1 });

  const listingIds = favorites
    .map((f) => f.listingId?._id?.toString() || f.listingId?.toString())
    .filter(Boolean);

  return res.status(200).json({
    success: true,
    count: favorites.length,
    listingIds,
    data: favorites,
  });
});

export default {
  addFavorite,
  removeFavorite,
  getFavorites,
};
