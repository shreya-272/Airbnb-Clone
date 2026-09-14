import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      country: { type: String, required: true },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    host: {
      name: { type: String, required: true },
      isSuperhost: { type: Boolean, default: false },
      avatar: { type: String, default: '' },
      bio: { type: String, default: '' },
      responseRate: { type: String, default: '100%' },
    },
    guestCapacity: {
      type: Number,
      required: [true, 'Guest capacity is required'],
      min: 1,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Bedrooms count is required'],
      min: 0,
    },
    beds: {
      type: Number,
      required: [true, 'Beds count is required'],
      min: 1,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Bathrooms count is required'],
      min: 0.5,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: 0,
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Beachfront',
      index: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

export default Listing;
