/**
 * API client to manage Favorites synchronized with MongoDB and localStorage
 */

const SESSION_STORAGE_KEY = 'airbnb_session_id';
const LOCAL_FAVORITES_KEY = 'airbnb_local_favorites';

/**
 * Get or generate a persistent user/session identifier.
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Check if a listing is favorited from MongoDB, falling back to localStorage.
 * 
 * @param {string} listingId - The MongoDB listing ID
 * @returns {Promise<boolean>} True if favorited, false otherwise
 */
export const checkFavoriteStatus = async (listingId) => {
  if (!listingId) return false;
  const sessionId = getSessionId();

  try {
    const res = await fetch(`/api/favorites?listingId=${listingId}`, {
      headers: {
        'x-session-id': sessionId,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const isFav = Boolean(data.isFavorited);

    // Sync to local cache
    updateLocalCache(listingId, isFav);
    return isFav;
  } catch (error) {
    console.warn(`[favoriteApi] Falling back to local cache for status: ${error.message}`);
    const local = getLocalFavorites();
    return Boolean(local[listingId]);
  }
};

/**
 * Add listing to favorites in MongoDB.
 * 
 * @param {string} listingId - The MongoDB listing ID
 * @returns {Promise<boolean>}
 */
export const addFavorite = async (listingId) => {
  const sessionId = getSessionId();

  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({ listingId, sessionId }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to save favorite');
    }

    updateLocalCache(listingId, true);
    return true;
  } catch (error) {
    console.error('[favoriteApi] Error adding favorite to MongoDB:', error);
    // Persist locally even if network fails
    updateLocalCache(listingId, true);
    throw error;
  }
};

/**
 * Remove listing from favorites in MongoDB.
 * 
 * @param {string} listingId - The MongoDB listing ID
 * @returns {Promise<boolean>}
 */
export const removeFavorite = async (listingId) => {
  const sessionId = getSessionId();

  try {
    const res = await fetch(`/api/favorites/${listingId}`, {
      method: 'DELETE',
      headers: {
        'x-session-id': sessionId,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to remove favorite');
    }

    updateLocalCache(listingId, false);
    return false;
  } catch (error) {
    console.error('[favoriteApi] Error removing favorite from MongoDB:', error);
    updateLocalCache(listingId, false);
    throw error;
  }
};

/**
 * Helper to get local favorites dictionary.
 */
const getLocalFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) || '{}');
  } catch {
    return {};
  }
};

/**
 * Helper to update local favorites cache.
 */
const updateLocalCache = (listingId, isFav) => {
  try {
    const local = getLocalFavorites();
    if (isFav) {
      local[listingId] = true;
    } else {
      delete local[listingId];
    }
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(local));
  } catch (e) {
    console.warn('[favoriteApi] Error updating localStorage cache:', e);
  }
};

export default {
  getSessionId,
  checkFavoriteStatus,
  addFavorite,
  removeFavorite,
};
