/**
 * API client to fetch and submit listing reviews
 */

/**
 * Fetch all reviews for a listing from MongoDB.
 * 
 * @param {string} listingId - The MongoDB listing ID
 * @returns {Promise<{ count: number, categoryAverages: Object, data: Array }>}
 */
export const fetchListingReviews = async (listingId) => {
  if (!listingId) return { count: 0, categoryAverages: {}, data: [] };

  try {
    const response = await fetch(`/api/listings/${listingId}/reviews`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[reviewApi] Error fetching reviews for ${listingId}:`, error);
    throw error;
  }
};

/**
 * Submit a new review for a listing.
 * 
 * @param {string} listingId - The MongoDB listing ID
 * @param {Object} reviewData - { author, rating, categoryRatings, comment }
 * @returns {Promise<Object>}
 */
export const submitReview = async (listingId, reviewData) => {
  if (!listingId) throw new Error('Listing ID is required');

  try {
    const response = await fetch(`/api/listings/${listingId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Failed to submit review (HTTP ${response.status})`);
    }

    return result;
  } catch (error) {
    console.error('[reviewApi] Error submitting review:', error);
    throw error;
  }
};

export default {
  fetchListingReviews,
  submitReview,
};
