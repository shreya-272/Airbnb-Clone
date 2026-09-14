import { getSessionId } from './favoriteApi.js';

/**
 * Submit a reservation request to the backend.
 * 
 * @param {Object} params
 * @param {string} params.listingId - MongoDB ObjectId of listing
 * @param {string} params.checkIn - ISO Date string YYYY-MM-DD
 * @param {string} params.checkOut - ISO Date string YYYY-MM-DD
 * @param {{ adults: number, children: number, infants: number }} params.guests
 * @returns {Promise<Object>} Confirmation response with confirmation code and pricing breakdown
 */
export const submitBooking = async ({ listingId, checkIn, checkOut, guests }) => {
  if (!listingId) throw new Error('Listing ID is required for booking');
  if (!checkIn || !checkOut) throw new Error('Please select valid check-in and checkout dates');
  const sessionId = getSessionId();

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        userId: sessionId,
        listingId,
        checkIn,
        checkOut,
        guests,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || data.error || `Booking failed with status ${response.status}`;
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.statusCode) {
      error.isNetworkError = true;
      error.message = 'Network connection failed: Unable to reach reservation server. Please verify backend server is running.';
    }
    console.error('[bookingApi] Error submitting booking:', error);
    throw error;
  }
};

/**
 * Fetch all reservations made by the current user/session.
 * 
 * @returns {Promise<Array>} Array of populated booking documents
 */
export const fetchUserBookings = async () => {
  const sessionId = getSessionId();

  try {
    const response = await fetch('/api/bookings', {
      headers: {
        'x-session-id': sessionId,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || data.error || `Failed to fetch bookings (${response.status})`;
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    return data.data || [];
  } catch (error) {
    if (!error.statusCode) {
      error.isNetworkError = true;
      error.message = 'Network connection failed: Unable to fetch bookings from server.';
    }
    console.error('[bookingApi] Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Cancel a reservation.
 * 
 * @param {string} bookingId
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (bookingId) => {
  if (!bookingId) throw new Error('Booking ID is required');

  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || data.error || `Failed to cancel booking (${response.status})`;
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.statusCode) {
      error.isNetworkError = true;
      error.message = 'Network connection failed: Unable to cancel reservation.';
    }
    console.error('[bookingApi] Error cancelling booking:', error);
    throw error;
  }
};

export default {
  submitBooking,
  fetchUserBookings,
  cancelBooking,
};


