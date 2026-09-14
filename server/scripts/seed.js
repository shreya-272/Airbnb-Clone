import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import { recalculateListingRating } from '../controllers/reviewController.js';

// Resolve current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleListing = {
  title: 'Villa Paradiso - Cliffside Luxury Ocean Villa',
  location: {
    address: 'Via Panoramica 14',
    city: 'Amalfi',
    state: 'Campania',
    country: 'Italy',
  },
  rating: 4.98,
  reviewCount: 68,
  host: {
    name: 'Isabella',
    isSuperhost: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    bio: 'Dedicated luxury property host on the Amalfi Coast providing tailored concierge experiences.',
    responseRate: '100%',
  },
  guestCapacity: 8,
  bedrooms: 4,
  beds: 5,
  bathrooms: 4.5,
  pricePerNight: 385,
  cleaningFee: 150,
  serviceFee: 273,
  description:
    'Perched high on the private cliffs of Amalfi, Villa Paradiso offers unrivaled panoramic vistas across the Mediterranean Sea. Featuring private infinity swimming pools, lush olive groves, and architectural glass walls, this villa blends timeless Italian elegance with contemporary luxury.',
  amenities: [
    'Infinity pool & hot tub',
    'Fast Wi-Fi (250 Mbps)',
    'Free parking with EV charger',
    'Chef kitchen with wood pizza oven',
    '75-inch 4K Cinema TV',
    'Central air conditioning',
    'Ocean view',
    'Dedicated workspace',
    'Washer & dryer',
    'Outdoor dining area',
    'Patio or balcony',
    'Beach access',
  ],
  images: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  ],
  coordinates: {
    lat: 40.634,
    lng: 14.6027,
  },
};

const sampleReviews = [
  {
    author: {
      name: 'Sophia Martinez',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      location: 'San Francisco, California',
    },
    rating: 5,
    categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    comment:
      'Our family stayed at Villa Paradiso for our 10th anniversary, and it completely exceeded our wildest expectations. The cliffside views at sunrise and sunset are breathtaking. Isabella was an incredible host who organized our private boat charter.',
    createdAt: new Date('2026-08-20'),
  },
  {
    author: {
      name: 'Alexander Wright',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      location: 'London, United Kingdom',
    },
    rating: 5,
    categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    comment:
      'The infinity pool looking out over the Mediterranean is the finest feature of any villa we have ever rented. Clean, incredibly spacious, high-speed Wi-Fi worked flawlessly for our remote work days.',
    createdAt: new Date('2026-08-05'),
  },
  {
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      location: 'Zurich, Switzerland',
    },
    rating: 5,
    categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 5 },
    comment:
      'A true piece of paradise on the Amalfi Coast. Spotlessly clean, beautifully appointed bedrooms, and delicious local pastries waiting for us upon arrival. 10/10 recommendation!',
    createdAt: new Date('2026-07-28'),
  },
  {
    author: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      location: 'Toronto, Canada',
    },
    rating: 5,
    categoryRatings: { cleanliness: 5, accuracy: 5, checkIn: 5, communication: 5, location: 5, value: 4 },
    comment:
      'Spectacular villa with first-class amenities. The outdoor pizza oven and dining terrace hosted our favourite dinner of our entire Italy trip. Isabella’s responsiveness was remarkable.',
    createdAt: new Date('2026-07-14'),
  },
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Airbnb';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Upsert the sample listing by title
    const existing = await Listing.findOne({ title: sampleListing.title });
    let listing;

    if (existing) {
      console.log(`Listing already exists with ID: ${existing._id}. Updating document...`);
      listing = await Listing.findByIdAndUpdate(existing._id, sampleListing, { new: true });
    } else {
      console.log('Inserting new sample listing...');
      listing = await Listing.create(sampleListing);
    }

    // Seed sample reviews
    await Review.deleteMany({ listingId: listing._id });
    const reviewsToInsert = sampleReviews.map((r) => ({
      ...r,
      listingId: listing._id,
    }));
    await Review.insertMany(reviewsToInsert);
    console.log(`Inserted ${reviewsToInsert.length} authentic guest reviews.`);

    // Recalculate listing ratings
    const updatedStats = await recalculateListingRating(listing._id);

    console.log('\n=============================================');
    console.log('DATABASE SEEDED SUCCESSFULLY WITH REVIEWS!');
    console.log('=============================================');
    console.log(`Listing:     ${listing.title}`);
    console.log(`Document ID: ${listing._id}`);
    console.log(`Rating:      ${updatedStats.rating} (${updatedStats.reviewCount} reviews)`);
    console.log('=============================================');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
