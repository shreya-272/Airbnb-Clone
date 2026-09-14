import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Fetch a single listing by its MongoDB ID from the backend API.
 * Automatically tries relative proxy path first, then falls back to direct API_BASE_URL.
 * 
 * @param {string} id - The 24-character hex MongoDB ObjectId
 * @returns {Promise<Object>} The listing document data
 */
export const fetchListingById = async (id = '6aa7d647bda80dd066fe3c61') => {
  if (!id) {
    throw new Error('A listing ID is required to fetch listing details');
  }

  try {
    // Primary: use Vite dev proxy '/api/listings/:id'
    let response;
    try {
      response = await fetch(`/api/listings/${id}`);
    } catch {
      // Fallback: direct backend URL
      response = await fetch(`${API_BASE_URL}/api/listings/${id}`);
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error(`[listingApi] Failed to fetch listing ${id}:`, error);
    throw error;
  }
};

/**
 * Custom React hook to fetch and manage listing state: data, loading, error, and refetch.
 * 
 * @param {string} id - The MongoDB ObjectId of the listing
 * @returns {{ data: Object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export const useListing = (id = '6aa7d647bda80dd066fe3c61') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getListing = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const listingData = await fetchListingById(id);
      setData(listingData);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while fetching listing');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getListing();
  }, [getListing]);

  return {
    data,
    loading,
    error,
    refetch: getListing,
  };
};

export default {
  fetchListingById,
  useListing,
};
