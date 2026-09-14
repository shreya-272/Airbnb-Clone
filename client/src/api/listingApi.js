import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Fetch a single listing by its MongoDB ID from the backend API.
 * Distinguishes network failures from HTTP 404/400 errors.
 * 
 * @param {string} id - The 24-character hex MongoDB ObjectId
 * @returns {Promise<Object>} The listing document data
 */
export const fetchListingById = async (id = '6aa7d647bda80dd066fe3c61') => {
  if (!id) {
    const err = new Error('A listing ID is required to fetch listing details');
    err.statusCode = 400;
    throw err;
  }

  let response;
  try {
    // Primary: use relative proxy path
    try {
      response = await fetch(`/api/listings/${id}`);
    } catch {
      // Secondary: direct backend server URL
      response = await fetch(`${API_BASE_URL}/api/listings/${id}`);
    }
  } catch (networkErr) {
    const error = new Error('Network connection failed. Unable to reach backend server at http://localhost:5000.');
    error.isNetworkError = true;
    error.statusCode = 0;
    console.error(`[listingApi] Network error fetching listing ${id}:`, networkErr);
    throw error;
  }

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const message = errJson.message || errJson.error || `HTTP error ${response.status}: ${response.statusText}`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.isNotFound = response.status === 404;
    error.isBadRequest = response.status === 400;
    console.error(`[listingApi] Server returned ${response.status}:`, message);
    throw error;
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Custom React hook to fetch and manage listing state: data, loading, error, and refetch.
 * 
 * @param {string} id - The MongoDB ObjectId of the listing
 * @returns {{ data: Object|null, loading: boolean, error: string|null, isNetworkError: boolean, isNotFound: boolean, refetch: Function }}
 */
export const useListing = (id = '6aa7d647bda80dd066fe3c61') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  const getListing = useCallback(async (targetId = id) => {
    setLoading(true);
    setError(null);
    setIsNetworkError(false);
    setIsNotFound(false);

    try {
      const listingData = await fetchListingById(targetId);
      setData(listingData);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while fetching listing');
      setIsNetworkError(Boolean(err.isNetworkError));
      setIsNotFound(Boolean(err.isNotFound || err.statusCode === 404));
      setData(null);
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
    isNetworkError,
    isNotFound,
    refetch: getListing,
  };
};

/**
 * Fetch all listings with optional category and search filters.
 * 
 * @param {Object} options
 * @param {string} [options.category]
 * @param {string} [options.search]
 * @returns {Promise<Array>} Array of listing documents
 */
export const fetchAllListings = async ({ category = '', search = '' } = {}) => {
  const params = new URLSearchParams();
  if (category && category.toLowerCase() !== 'all') params.append('category', category);
  if (search && search.trim()) params.append('search', search.trim());
  const queryString = params.toString() ? `?${params.toString()}` : '';

  try {
    let response;
    try {
      response = await fetch(`/api/listings${queryString}`);
    } catch {
      response = await fetch(`${API_BASE_URL}/api/listings${queryString}`);
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const message = errJson.message || errJson.error || `HTTP error ${response.status}`;
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    if (!error.statusCode) {
      error.isNetworkError = true;
      error.message = 'Network connection failed: Unable to fetch resorts from server.';
    }
    console.error('[listingApi] Error fetching all listings:', error);
    throw error;
  }
};

export default {
  fetchListingById,
  fetchAllListings,
  useListing,
};


