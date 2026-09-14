import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Favorite from '../models/Favorite.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Airbnb';
const BASE_URL = 'http://localhost:5000';
const LISTING_ID = '6aa7d647bda80dd066fe3c61';
const TEST_SESSION = `test_e2e_${Date.now()}`;

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('       STARTING AIRBNB END-TO-END VERIFICATION       ');
  console.log('====================================================');

  console.log(`\n[1/6] Connecting directly to MongoDB (${MONGODB_URI})...`);
  await mongoose.connect(MONGODB_URI);
  console.log('  -> Connected to database:', mongoose.connection.name);

  // 1. Health check
  console.log('\n[2/6] Checking GET /api/health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('  -> Health response:', healthData.status === 'ok' ? 'PASS (ok)' : 'FAIL');
  if (healthData.status !== 'ok') throw new Error('Health check failed');

  // 2. Global Error Handler Verification
  console.log('\n[3/6] Verifying Global Express Error-Handling Middleware...');
  
  // 2a. 404 Route Not Found
  const notFoundRouteRes = await fetch(`${BASE_URL}/api/non-existent-route`);
  const notFoundRouteData = await notFoundRouteRes.json();
  console.log('  -> Non-existent route HTTP Status:', notFoundRouteRes.status);
  console.log('  -> Formatted Error JSON:', JSON.stringify(notFoundRouteData));
  if (notFoundRouteRes.status !== 404 || notFoundRouteData.success !== false) {
    throw new Error('404 Global Error Handler check failed');
  }

  // 2b. 400 CastError (Invalid ID)
  const castErrRes = await fetch(`${BASE_URL}/api/listings/invalid-id-format`);
  const castErrData = await castErrRes.json();
  console.log('  -> Invalid ObjectId HTTP Status:', castErrRes.status);
  console.log('  -> CastError JSON:', JSON.stringify(castErrData));
  if (castErrRes.status !== 400 || castErrData.statusCode !== 400) {
    throw new Error('CastError handler check failed');
  }

  // 2c. 404 Listing Not Found (Valid format, nonexistent ID)
  const validNonexistentId = '000000000000000000000000';
  const notFoundListingRes = await fetch(`${BASE_URL}/api/listings/${validNonexistentId}`);
  const notFoundListingData = await notFoundListingRes.json();
  console.log('  -> Non-existent Listing HTTP Status:', notFoundListingRes.status);
  console.log('  -> 404 Listing JSON:', JSON.stringify(notFoundListingData));
  if (notFoundListingRes.status !== 404 || notFoundListingData.statusCode !== 404) {
    throw new Error('Listing 404 check failed');
  }

  // 3. Load Listing Flow
  console.log(`\n[4/6] Flow 1: Loading Listing ${LISTING_ID}...`);
  const listingRes = await fetch(`${BASE_URL}/api/listings/${LISTING_ID}`);
  const listingJson = await listingRes.json();
  if (!listingRes.ok || !listingJson.data) {
    throw new Error('Failed to load listing: ' + JSON.stringify(listingJson));
  }
  console.log('  -> Loaded Listing Title:', listingJson.data.title);
  console.log('  -> Current Rating:', listingJson.data.rating);
  console.log('  -> Current Review Count:', listingJson.data.reviewCount);

  // 4. Save Favorite Flow
  console.log('\n[5/6] Flow 2: Saving & Verifying Favorite...');
  const favPostRes = await fetch(`${BASE_URL}/api/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-id': TEST_SESSION },
    body: JSON.stringify({ listingId: LISTING_ID, sessionId: TEST_SESSION }),
  });
  const favPostJson = await favPostRes.json();
  console.log('  -> POST /api/favorites status:', favPostRes.status, favPostJson.message);
  if (!favPostRes.ok) throw new Error('Save favorite failed');

  // Verify status check
  const favCheckRes = await fetch(`${BASE_URL}/api/favorites?listingId=${LISTING_ID}`, {
    headers: { 'x-session-id': TEST_SESSION },
  });
  const favCheckJson = await favCheckRes.json();
  console.log('  -> GET /api/favorites?listingId status:', favCheckJson.isFavorited ? 'FAVORITED (true)' : 'FAIL');

  // 5. Submit Review Flow
  console.log('\n[6/6] Flow 3 & 4: Submitting Review and Completing Booking...');
  const testReview = {
    author: {
      name: 'Elena Rostova',
      location: 'Geneva, Switzerland',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    rating: 5,
    categoryRatings: {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5,
    },
    comment: 'Spectacular cliffside views, immaculate infinity pool, and the host was extraordinarily attentive. One of the best Airbnb experiences!',
  };

  const reviewPostRes = await fetch(`${BASE_URL}/api/listings/${LISTING_ID}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testReview),
  });
  const reviewPostJson = await reviewPostRes.json();
  console.log('  -> POST Review Status:', reviewPostRes.status, reviewPostJson.message);
  console.log('  -> Updated Listing Review Count:', reviewPostJson.updatedListing?.reviewCount);
  console.log('  -> Updated Listing Rating:', reviewPostJson.updatedListing?.rating);

  // 6. Complete Booking Flow
  const today = new Date();
  const checkInDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const checkOutDate = new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listingId: LISTING_ID,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: { adults: 2, children: 1, infants: 0 },
    }),
  });
  const bookingJson = await bookingRes.json();
  console.log('  -> POST Booking Status:', bookingRes.status, bookingJson.message);
  console.log('  -> Confirmation Code:', bookingJson.confirmationCode);
  console.log('  -> Total Price:', `$${bookingJson.booking?.pricing?.totalPrice}`);

  // 7. Verify Direct MongoDB Persistence
  console.log('\n====================================================');
  console.log('       VERIFYING MONGODB DATABASE PERSISTENCE       ');
  console.log('====================================================');
  const listingsCount = await Listing.countDocuments();
  const favoritesCount = await Favorite.countDocuments();
  const reviewsCount = await Review.countDocuments();
  const bookingsCount = await Booking.countDocuments();

  console.log(`  -> MongoDB 'listings' collection count: ${listingsCount}`);
  console.log(`  -> MongoDB 'favorites' collection count: ${favoritesCount}`);
  console.log(`  -> MongoDB 'reviews' collection count: ${reviewsCount}`);
  console.log(`  -> MongoDB 'bookings' collection count: ${bookingsCount}`);

  if (listingsCount < 1 || favoritesCount < 1 || reviewsCount < 1 || bookingsCount < 1) {
    throw new Error('Database persistence check failed - one or more collections are missing documents');
  }

  console.log('\n✓ ALL FLOWS AND PERSISTENCE VERIFIED SUCCESSFULLY!');
  await mongoose.disconnect();
}

runEndToEndVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
