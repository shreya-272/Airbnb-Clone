/**
 * API client to submit and manage bookings in MongoDB
 */

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

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId,
        checkIn,
        checkOut,
        guests,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Booking failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('[bookingApi] Error submitting booking:', error);
    throw error;
  }
};

export default {
  submitBooking,
};
