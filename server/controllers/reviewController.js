import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Helper function to recalculate and update a listing's average rating and reviewCount
 * @param {string|mongoose.Types.ObjectId} listingId 
 */
export const recalculateListingRating = async (listingId) => {
  const objectId = new mongoose.Types.ObjectId(listingId);

  const stats = await Review.aggregate([
    { $match: { listingId: objectId } },
    {
      $group: {
        _id: '$listingId',
        avgRating: { $avg: '$rating' },
        avgCleanliness: { $avg: '$categoryRatings.cleanliness' },
        avgAccuracy: { $avg: '$categoryRatings.accuracy' },
        avgCheckIn: { $avg: '$categoryRatings.checkIn' },
        avgCommunication: { $avg: '$categoryRatings.communication' },
        avgLocation: { $avg: '$categoryRatings.location' },
        avgValue: { $avg: '$categoryRatings.value' },
        count: { $sum: 1 },
      },
    },
  ]);

  let updatedRating = 0;
  let updatedCount = 0;

  if (stats.length > 0) {
    updatedRating = Math.round(stats[0].avgRating * 100) / 100;
    updatedCount = stats[0].count;
  }

  await Listing.findByIdAndUpdate(listingId, {
    rating: updatedRating,
    reviewCount: updatedCount,
  });

  return {
    rating: updatedRating,
    reviewCount: updatedCount,
    categoryAverages: stats.length
      ? {
          cleanliness: Math.round(stats[0].avgCleanliness * 10) / 10,
          accuracy: Math.round(stats[0].avgAccuracy * 10) / 10,
          checkIn: Math.round(stats[0].avgCheckIn * 10) / 10,
          communication: Math.round(stats[0].avgCommunication * 10) / 10,
          location: Math.round(stats[0].avgLocation * 10) / 10,
          value: Math.round(stats[0].avgValue * 10) / 10,
        }
      : null,
  };
};

/**
 * @desc    Fetch all reviews for a specific listing
 * @route   GET /api/listings/:id/reviews
 * @access  Public
 */
export const getReviewsForListing = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid listing ID format: "${id}"`, 400);
  }

  const listingExists = await Listing.exists({ _id: id });
  if (!listingExists) {
    throw new AppError(`Listing not found with ID: ${id}`, 404);
  }

  const reviews = await Review.find({ listingId: id }).sort({ createdAt: -1 });

  // Calculate category averages
  let categoryAverages = {
    cleanliness: 5.0,
    accuracy: 5.0,
    checkIn: 5.0,
    communication: 5.0,
    location: 5.0,
    value: 4.9,
  };

  if (reviews.length > 0) {
    const totals = reviews.reduce(
      (acc, r) => {
        acc.cleanliness += r.categoryRatings?.cleanliness || r.rating || 5;
        acc.accuracy += r.categoryRatings?.accuracy || r.rating || 5;
        acc.checkIn += r.categoryRatings?.checkIn || r.rating || 5;
        acc.communication += r.categoryRatings?.communication || r.rating || 5;
        acc.location += r.categoryRatings?.location || r.rating || 5;
        acc.value += r.categoryRatings?.value || r.rating || 5;
        return acc;
      },
      { cleanliness: 0, accuracy: 0, checkIn: 0, communication: 0, location: 0, value: 0 }
    );

    categoryAverages = {
      cleanliness: Math.round((totals.cleanliness / reviews.length) * 10) / 10,
      accuracy: Math.round((totals.accuracy / reviews.length) * 10) / 10,
      checkIn: Math.round((totals.checkIn / reviews.length) * 10) / 10,
      communication: Math.round((totals.communication / reviews.length) * 10) / 10,
      location: Math.round((totals.location / reviews.length) * 10) / 10,
      value: Math.round((totals.value / reviews.length) * 10) / 10,
    };
  }

  return res.status(200).json({
    success: true,
    count: reviews.length,
    categoryAverages,
    data: reviews,
  });
});

/**
 * @desc    Add a review for a specific listing
 * @route   POST /api/listings/:id/reviews
 * @access  Public
 */
export const addReviewForListing = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { author, rating, categoryRatings, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid listing ID format: "${id}"`, 400);
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new AppError(`Listing not found with ID: ${id}`, 404);
  }

  if (!comment || !comment.trim()) {
    throw new AppError('Review comment is required', 400);
  }

  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new AppError('Rating must be a number between 1 and 5', 400);
  }

  const authorName = typeof author === 'object' ? author?.name : (author || 'Guest Traveler');
  const authorAvatar = typeof author === 'object' ? author?.avatar : undefined;
  const authorLocation = typeof author === 'object' ? author?.location : '';

  const newReview = await Review.create({
    listingId: id,
    author: {
      name: authorName || 'Guest Traveler',
      avatar: authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      location: authorLocation || 'Verified Guest',
    },
    rating: parsedRating,
    categoryRatings: categoryRatings || {
      cleanliness: parsedRating,
      accuracy: parsedRating,
      checkIn: parsedRating,
      communication: parsedRating,
      location: parsedRating,
      value: parsedRating,
    },
    comment: comment.trim(),
    createdAt: new Date(),
  });

  const updatedStats = await recalculateListingRating(id);

  return res.status(201).json({
    success: true,
    message: 'Review added successfully and listing rating updated',
    data: newReview,
    updatedListing: {
      rating: updatedStats.rating,
      reviewCount: updatedStats.reviewCount,
    },
  });
});

export default {
  getReviewsForListing,
  addReviewForListing,
  recalculateListingRating,
};
