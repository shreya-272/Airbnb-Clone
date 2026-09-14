import mongoose from 'mongoose';
import Favorite from '../models/Favorite.js';
import Listing from '../models/Listing.js';

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
export const addFavorite = async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = getIdentifier(req);

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'listingId is required in request body',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid listingId format',
        listingId,
      });
    }

    // Verify listing exists
    const listingExists = await Listing.exists({ _id: listingId });
    if (!listingExists) {
      return res.status(404).json({
        success: false,
        error: `Listing not found with ID: ${listingId}`,
      });
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
  } catch (error) {
    console.error(`[favoriteController] Error adding favorite: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while adding favorite',
      message: error.message,
    });
  }
};

/**
 * @desc    Remove a listing from favorites
 * @route   DELETE /api/favorites/:listingId
 * @access  Public
 */
export const removeFavorite = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = getIdentifier(req);

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing listingId parameter',
        listingId,
      });
    }

    const deleted = await Favorite.findOneAndDelete({ userId, listingId });

    return res.status(200).json({
      success: true,
      message: deleted
        ? 'Listing removed from favorites'
        : 'Listing was not in favorites',
      listingId,
      removed: Boolean(deleted),
    });
  } catch (error) {
    console.error(`[favoriteController] Error removing favorite: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while removing favorite',
      message: error.message,
    });
  }
};

/**
 * @desc    Check favorite status or retrieve all saved favorites
 * @route   GET /api/favorites
 * @access  Public
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = getIdentifier(req);
    const { listingId } = req.query;

    // If checking a specific listingId
    if (listingId) {
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid listingId format',
          listingId,
        });
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
  } catch (error) {
    console.error(`[favoriteController] Error fetching favorites: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching favorites',
      message: error.message,
    });
  }
};

export default {
  addFavorite,
  removeFavorite,
  getFavorites,
};
