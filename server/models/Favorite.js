import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID or Session ID is required'],
      trim: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing ID is required'],
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent duplicate favorites by the same user/session for the same listing
favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);

export default Favorite;
