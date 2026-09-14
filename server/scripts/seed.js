import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from '../models/Listing.js';

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

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Airbnb';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Upsert the sample listing by title
    const existing = await Listing.findOne({ title: sampleListing.title });
    let result;

    if (existing) {
      console.log(`Listing already exists with ID: ${existing._id}. Updating document...`);
      result = await Listing.findByIdAndUpdate(existing._id, sampleListing, { new: true });
    } else {
      console.log('Inserting new sample listing...');
      result = await Listing.create(sampleListing);
    }

    console.log('\n=============================================');
    console.log('SAMPLE LISTING SEEDED SUCCESSFULLY!');
    console.log('=============================================');
    console.log(`Database:   ${mongoose.connection.name}`);
    console.log(`Collection: ${Listing.collection.name}`);
    console.log(`Document ID: ${result._id}`);
    console.log(`Title:      ${result.title}`);
    console.log(`City/Country: ${result.location.city}, ${result.location.country}`);
    console.log(`Price/Night: $${result.pricePerNight}`);
    console.log(`Images:     ${result.images.length} photos`);
    console.log(`Amenities:  ${result.amenities.length} items`);
    console.log('=============================================');
    console.log('You can now open MongoDB Compass, connect to:');
    console.log('mongodb://localhost:27017');
    console.log(`and inspect the "${mongoose.connection.name}" database -> "${Listing.collection.name}" collection.\n`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
