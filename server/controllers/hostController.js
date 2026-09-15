import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const requireHost = (req) => {
  if (!['host', 'admin'].includes(req.user.role)) throw new AppError('Host access is required for this area.', 403);
};

export const getHostDashboard = asyncHandler(async (req, res) => {
  requireHost(req);
  const listingFilter = req.user.email === 'admin@gmail.com' || req.user.role === 'admin'
    ? { 'location.country': 'India' }
    : { 'host.name': req.user.name };
  const listings = await Listing.find(listingFilter).sort({ createdAt: -1 });
  const listingIds = listings.map((listing) => listing._id);
  const bookings = await Booking.find({ listingId: { $in: listingIds } }).populate('listingId', 'title location').sort({ createdAt: -1 });
  res.json({ success: true, data: { listings, bookings } });
});

export const createHostListing = asyncHandler(async (req, res) => {
  requireHost(req);
  const payload = req.body;
  if (payload.location?.country && payload.location.country.toLowerCase() !== 'india') throw new AppError('Havenly currently supports Indian resorts only.', 400);
  const listing = await Listing.create({
    ...payload,
    location: { ...payload.location, country: 'India' },
    host: { ...payload.host, name: req.user.name, avatar: req.user.avatar, bio: req.user.bio },
  });
  res.status(201).json({ success: true, data: listing });
});

export const updateHostListing = asyncHandler(async (req, res) => {
  requireHost(req);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new AppError('Invalid listing ID', 400);
  if (req.body.location?.country && req.body.location.country.toLowerCase() !== 'india') throw new AppError('Havenly currently supports Indian resorts only.', 400);
  const listing = await Listing.findOneAndUpdate({ _id: req.params.id, 'host.name': req.user.name }, { $set: { ...req.body, 'location.country': 'India' } }, { new: true, runValidators: true });
  if (!listing) throw new AppError('Listing not found or not owned by this host.', 404);
  res.json({ success: true, data: listing });
});