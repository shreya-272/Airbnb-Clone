import React, { useState, useEffect } from 'react';
import {
  Heart,
  Share2,
  Star,
  Award,
  Sparkles,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Server,
  Database,
  Wifi,
  Tv,
  Car,
  UtensilsCrossed,
  Waves,
  Wind,
  Coffee,
  ChevronDown,
  Plus,
  Minus,
  AlertTriangle,
  Briefcase,
  Home
} from 'lucide-react';
import { useListing } from './api/listingApi.js';
import { checkFavoriteStatus, addFavorite, removeFavorite } from './api/favoriteApi.js';
import { submitBooking } from './api/bookingApi.js';
import ListingSkeleton from './components/ListingSkeleton.js';

// Seeded listing ObjectId in MongoDB
const LISTING_ID = '6aa7d647bda80dd066fe3c61';

// Helper icon mapper for amenities
const getAmenityIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('pool') || lower.includes('tub') || lower.includes('water')) return <Waves className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('parking') || lower.includes('ev')) return <Car className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('kitchen') || lower.includes('oven') || lower.includes('dining')) return <UtensilsCrossed className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('tv') || lower.includes('cinema')) return <Tv className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('air') || lower.includes('condition')) return <Wind className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('workspace') || lower.includes('desk')) return <Briefcase className="w-5 h-5 text-airbnb-gray" />;
  if (lower.includes('coffee')) return <Coffee className="w-5 h-5 text-airbnb-gray" />;
  return <Home className="w-5 h-5 text-airbnb-gray" />;
};

export default function App() {
  // Use custom hook to fetch listing from MongoDB
  const { data: listing, loading, error, refetch } = useListing(LISTING_ID);

  // Backend Health state for top system status banner
  const [health, setHealth] = useState({
    loading: true,
    data: null,
    error: null,
  });

  // User interaction states
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [checkIn, setCheckIn] = useState('2026-10-12');
  const [checkOut, setCheckOut] = useState('2026-10-17');
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [isGuestOpen, setIsGuestOpen] = useState(false);

  // Booking states
  const [bookingStatus, setBookingStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingErrorMessage, setBookingErrorMessage] = useState(null);

  const fetchHealth = async () => {
    setHealth((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setHealth({ loading: false, data, error: null });
    } catch (err) {
      setHealth({ loading: false, data: null, error: err.message });
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Synchronize Favorite state from MongoDB when listing loads
  useEffect(() => {
    if (listing?._id) {
      checkFavoriteStatus(listing._id)
        .then((saved) => setIsWishlisted(saved))
        .catch((err) => console.error('[App] Error checking favorite status:', err));
    }
  }, [listing?._id]);

  // Handle favorite toggle synchronized with MongoDB & localStorage
  const handleToggleFavorite = async () => {
    if (!listing?._id || isSavingFavorite) return;

    const nextStatus = !isWishlisted;
    setIsWishlisted(nextStatus);
    setIsSavingFavorite(true);

    try {
      if (nextStatus) {
        await addFavorite(listing._id);
      } else {
        await removeFavorite(listing._id);
      }
    } catch (err) {
      console.error('[App] Failed to sync favorite with MongoDB:', err);
      // Rollback on network failure
      setIsWishlisted(!nextStatus);
    } finally {
      setIsSavingFavorite(false);
    }
  };

  // Handle booking submission to MongoDB
  const handleReserve = async () => {
    if (!listing?._id || bookingStatus === 'submitting') return;

    setBookingStatus('submitting');
    setBookingErrorMessage(null);

    try {
      const result = await submitBooking({
        listingId: listing._id,
        checkIn,
        checkOut,
        guests,
      });

      setBookingConfirmation(result);
      setBookingStatus('success');
    } catch (err) {
      console.error('[App] Booking submission error:', err);
      setBookingStatus('error');
      setBookingErrorMessage(err.message || 'Failed to submit reservation request');
    }
  };

  // Dynamic pricing calculations derived from MongoDB listing data
  const nightlyRate = listing?.pricePerNight || 385;
  const nights = 5;
  const basePrice = nightlyRate * nights;
  const cleaningFee = listing?.cleaningFee !== undefined ? listing.cleaningFee : 150;
  const serviceFee = listing?.serviceFee !== undefined ? listing.serviceFee : Math.round(basePrice * 0.142);
  const taxes = Math.round((basePrice + cleaningFee) * 0.085);
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;
  const totalGuests = guests.adults + guests.children;

  // Fallback images if not populated yet
  const listingImages = listing?.images?.length
    ? listing.images
    : [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      ];

  return (
    <div className="min-h-screen bg-white text-airbnb-black font-sans">
      {/* Top Architecture Status Banner */}
      <aside aria-label="System status" className="bg-slate-900 text-white text-xs px-4 py-2.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              {health.data?.status === 'ok' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="font-semibold tracking-wide uppercase text-slate-300">
              MongoDB + Express Full-Stack Status:
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-4">
            {/* Express Server */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Express:</span>
              {health.loading ? (
                <span className="text-slate-400">Connecting...</span>
              ) : health.error ? (
                <span className="text-rose-400 font-medium">Offline</span>
              ) : (
                <span className="text-emerald-400 font-medium">Port 5000 (Live)</span>
              )}
            </div>

            {/* MongoDB Mongoose */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB:</span>
              {health.loading ? (
                <span className="text-slate-400">Verifying...</span>
              ) : health.data?.database?.status === 'connected' ? (
                <span className="text-emerald-400 font-medium">
                  {health.data.database.name} (Active)
                </span>
              ) : (
                <span className="text-rose-400 font-medium">Disconnected</span>
              )}
            </div>

            {/* Hook Status Pill */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
              <span className="font-mono text-[11px] text-sky-300">useListing()</span>
              {loading ? (
                <span className="text-amber-400 font-medium">fetching...</span>
              ) : error ? (
                <span className="text-rose-400 font-medium">error</span>
              ) : (
                <span className="text-emerald-400 font-medium">MongoDB Synced</span>
              )}
            </div>

            <button
              onClick={() => {
                fetchHealth();
                refetch();
              }}
              disabled={loading || health.loading}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs transition border border-slate-700 active:scale-95 disabled:opacity-50"
              title="Refresh health and listing from DB"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync DB</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Global Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-airbnb-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <svg className="h-8 w-auto text-brand" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.328l.011.389c0 4.002-3.136 7.2-7.1 7.2-2.146 0-4.095-.944-5.4-2.483-1.305 1.539-3.254 2.483-5.4 2.483-3.964 0-7.1-3.198-7.1-7.2 0-1.127.311-2.316.971-3.717l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.328 0-2.348.647-3.414 2.545l-.547 1.054c-1.94 3.8-6.096 12.5-7.067 14.763l-.135.332c-.596 1.264-.837 2.227-.837 3.106 0 2.871 2.228 5.2 5.1 5.2 1.776 0 3.447-.94 4.382-2.463l.518-.847.518.847c.935 1.523 2.606 2.463 4.382 2.463 2.872 0 5.1-2.329 5.1-5.2 0-.879-.241-1.842-.837-3.106l-.135-.332c-.971-2.263-5.127-10.963-7.067-14.763l-.547-1.054C18.348 3.647 17.328 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.905-1.332 3.498-3.103 3.899l-.297.049-.6.052c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .977.701 1.79 1.636 1.967l.178.024.186.009c1.105 0 2-.895 2-2 0-1.105-.895-2-2-2z" />
            </svg>
            <span className="text-xl font-bold text-brand tracking-tight hidden sm:inline">airbnb</span>
          </div>

          {/* Search Pill */}
          <div className="flex items-center border border-airbnb-border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition cursor-pointer text-sm font-medium space-x-3 divide-x divide-airbnb-border">
            <span className="pr-3 text-airbnb-black font-semibold">Anywhere</span>
            <span className="px-3 text-airbnb-black font-semibold">Any week</span>
            <div className="pl-3 flex items-center space-x-2 text-airbnb-gray">
              <span>Add guests</span>
              <div className="bg-brand text-white p-2 rounded-full">
                <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4 text-sm font-medium">
            <span className="hidden md:inline cursor-pointer hover:bg-airbnb-bgSubtle px-3 py-2 rounded-full transition">
              Airbnb your home
            </span>
            <button className="p-2.5 rounded-full hover:bg-airbnb-bgSubtle transition" aria-label="Language & Currency">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 1 0 8 8 8.01 8.01 0 0 0-8-8zm5.93 7h-2.5a13.3 13.3 0 0 0-1.07-4.48A6.02 6.02 0 0 1 13.93 7zM8 2.06c.64 1.13 1.18 2.8 1.4 4.94H6.6c.22-2.14.76-3.81 1.4-4.94zM2.07 7A6.02 6.02 0 0 1 5.64 2.52 13.3 13.3 0 0 0 4.57 7zm0 2h2.5a13.3 13.3 0 0 0 1.07 4.48A6.02 6.02 0 0 1 2.07 9zm5.93 4.94c-.64-1.13-1.18-2.8-1.4-4.94h2.8c-.22 2.14-.76 3.81-1.4 4.94zm2.36-4.94h2.5a6.02 6.02 0 0 1-3.57 4.48 13.3 13.3 0 0 0 1.07-4.48z" />
              </svg>
            </button>
            <div className="flex items-center border border-airbnb-border rounded-full p-1.5 space-x-2.5 hover:shadow-md transition cursor-pointer">
              <svg className="w-4 h-4 ml-1.5 text-airbnb-gray" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M4 8h24M4 16h24M4 24h24" />
              </svg>
              <div className="bg-airbnb-gray text-white rounded-full p-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Listing Detail Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Loading State: Skeleton */}
        {loading ? (
          <ListingSkeleton />
        ) : error ? (
          /* Error State */
          <div className="my-16 text-center max-w-lg mx-auto p-8 border border-rose-200 bg-rose-50 rounded-2xl shadow-sm">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-rose-900 mb-2">Failed to Load Listing</h2>
            <p className="text-sm text-rose-700 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="bg-brand text-white font-semibold px-6 py-2.5 rounded-xl shadow hover:bg-brand-hover transition"
            >
              Try Again
            </button>
          </div>
        ) : listing ? (
          /* Populated State with Live MongoDB Data */
          <>
            {/* Listing Title Header */}
            <section className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-airbnb-black tracking-tight">
                {listing.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-between text-sm gap-2">
                <div className="flex items-center flex-wrap space-x-2">
                  <span className="flex items-center font-semibold text-airbnb-black">
                    <Star className="w-4 h-4 fill-airbnb-black text-airbnb-black mr-1" />
                    {listing.rating || 'New'}
                  </span>
                  <span className="text-airbnb-gray">·</span>
                  <span className="underline font-semibold cursor-pointer">
                    {listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''}
                  </span>
                  {listing.host?.isSuperhost && (
                    <>
                      <span className="text-airbnb-gray">·</span>
                      <span className="flex items-center text-airbnb-black font-semibold">
                        <Award className="w-4 h-4 text-brand mr-1" />
                        Superhost
                      </span>
                    </>
                  )}
                  <span className="text-airbnb-gray">·</span>
                  <span className="underline cursor-pointer text-airbnb-gray hover:text-airbnb-black">
                    {listing.location?.city}, {listing.location?.state ? `${listing.location.state}, ` : ''}{listing.location?.country}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-airbnb-black font-medium hover:bg-airbnb-bgSubtle px-3 py-1.5 rounded-lg transition">
                    <Share2 className="w-4 h-4" />
                    <span className="underline">Share</span>
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isSavingFavorite}
                    className="flex items-center space-x-2 text-airbnb-black font-medium hover:bg-airbnb-bgSubtle px-3 py-1.5 rounded-lg transition active:scale-95 disabled:opacity-75"
                    title={isWishlisted ? 'Remove from saved' : 'Save to wishlist'}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform duration-200 active:scale-125 ${
                        isWishlisted ? 'fill-brand text-brand' : 'text-airbnb-black'
                      }`}
                    />
                    <span className="underline">
                      {isSavingFavorite ? 'Saving...' : isWishlisted ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* 5-Photo Bento Gallery Grid */}
            <section className="relative rounded-2xl overflow-hidden mb-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-72 sm:h-[420px]">
                {/* Main Hero Photo (images[0]) */}
                <div className="md:col-span-2 relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 1 (images[1]) */}
                <div className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[1] || listingImages[0]}
                    alt="Property detail 1"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 2 (images[2]) */}
                <div className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[2] || listingImages[0]}
                    alt="Property detail 2"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 3 (images[3]) */}
                <div className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[3] || listingImages[0]}
                    alt="Property detail 3"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 4 (images[4]) */}
                <div className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[4] || listingImages[0]}
                    alt="Property detail 4"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>
              </div>

              <button className="absolute bottom-5 right-5 bg-white text-airbnb-black font-semibold text-sm px-4 py-2 rounded-lg border border-airbnb-black shadow-md hover:bg-airbnb-bgSubtle transition flex items-center space-x-2">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3zm8 0a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-2zM3 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H3zm8 0a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2z" />
                </svg>
                <span>Show all {listing.images?.length || 5} photos</span>
              </button>
            </section>

            {/* Main Two-Column Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column (Content) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Host Overview */}
                <div className="flex items-center justify-between pb-6 border-b border-airbnb-borderLight">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Entire home hosted by {listing.host?.name || 'Host'}
                    </h2>
                    <p className="text-airbnb-gray text-sm mt-1">
                      {listing.guestCapacity} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
                    </p>
                  </div>
                  <div className="relative">
                    <img
                      src={listing.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                      alt={listing.host?.name || 'Host'}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                    />
                    {listing.host?.isSuperhost && (
                      <div className="absolute -bottom-1 -right-1 bg-brand text-white p-1 rounded-full" title="Superhost">
                        <Award className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Guest Favorite Badge */}
                <div className="flex items-center space-x-4 p-4 border border-airbnb-border rounded-xl bg-airbnb-bgSubtle">
                  <Sparkles className="w-7 h-7 text-brand flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Guest favourite</div>
                    <div className="text-xs text-airbnb-gray">
                      One of the most loved homes on Airbnb based on ratings, reviews, and reliability.
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold">{listing.rating}</div>
                    <div className="flex text-airbnb-black justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-4 pb-6 border-b border-airbnb-borderLight text-sm">
                  {listing.host?.isSuperhost && (
                    <div className="flex items-start space-x-4">
                      <Award className="w-6 h-6 text-airbnb-black flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">{listing.host.name} is a Superhost</div>
                        <div className="text-airbnb-gray">{listing.host.bio || 'Superhosts are experienced, highly rated hosts committed to great stays.'}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-airbnb-black flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Exceptional cliffside location</div>
                      <div className="text-airbnb-gray">95% of recent guests gave the location a 5-star rating.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle2 className="w-6 h-6 text-airbnb-black flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Free cancellation for 48 hours</div>
                      <div className="text-airbnb-gray">Get a full refund if you change your plans before check-in.</div>
                    </div>
                  </div>
                </div>

                {/* Description from MongoDB */}
                <div className="pb-6 border-b border-airbnb-borderLight text-sm leading-relaxed text-airbnb-black">
                  <h3 className="text-lg font-semibold mb-3">About this place</h3>
                  <p className="whitespace-pre-line">{listing.description}</p>
                  <button className="mt-3 font-semibold underline flex items-center space-x-1">
                    <span>Show more</span>
                    <span className="text-xs">›</span>
                  </button>
                </div>

                {/* Amenities dynamically mapped from MongoDB */}
                <div className="pb-6 border-b border-airbnb-borderLight">
                  <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
                    {listing.amenities?.map((amenity, idx) => (
                      <div key={idx} className="flex items-center space-x-3 text-airbnb-black">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 border border-airbnb-black font-semibold text-sm px-6 py-3 rounded-lg hover:bg-airbnb-bgSubtle transition">
                    Show all {listing.amenities?.length || 0} amenities
                  </button>
                </div>
              </div>

              {/* Right Column (Sticky Reservation Sidebar) */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 border border-airbnb-border rounded-2xl p-6 shadow-card bg-white">
                  {/* Price & Rating Header */}
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold text-airbnb-black">${nightlyRate}</span>
                      <span className="text-airbnb-gray text-sm"> / night</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 fill-airbnb-black text-airbnb-black mr-1" />
                      <span className="font-semibold">{listing.rating}</span>
                      <span className="text-airbnb-gray mx-1">·</span>
                      <span className="text-airbnb-gray underline">{listing.reviewCount} reviews</span>
                    </div>
                  </div>

                  {/* Segmented Inputs Container */}
                  <div className="border border-airbnb-border rounded-xl overflow-hidden mb-4">
                    {/* Date Row */}
                    <div className="grid grid-cols-2 divide-x divide-airbnb-border border-b border-airbnb-border">
                      <div className="p-3 cursor-pointer hover:bg-airbnb-bgSubtle transition">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-airbnb-black">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full text-xs font-medium text-airbnb-black bg-transparent outline-none cursor-pointer"
                        />
                      </div>
                      <div className="p-3 cursor-pointer hover:bg-airbnb-bgSubtle transition">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-airbnb-black">
                          Checkout
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full text-xs font-medium text-airbnb-black bg-transparent outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Guests Row */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsGuestOpen(!isGuestOpen)}
                        className="w-full p-3 text-left hover:bg-airbnb-bgSubtle transition flex items-center justify-between"
                      >
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-airbnb-black">
                            Guests
                          </span>
                          <span className="text-xs font-medium text-airbnb-black">
                            {totalGuests} guest{totalGuests > 1 ? 's' : ''}
                            {guests.infants > 0 ? `, ${guests.infants} infant` : ''}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-airbnb-gray transition-transform ${isGuestOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Guest Dropdown Popover */}
                      {isGuestOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-airbnb-border rounded-xl shadow-dropdown p-4 z-20 space-y-4">
                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">Adults</div>
                              <div className="text-xs text-airbnb-gray">Age 13+</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                disabled={guests.adults <= 1}
                                onClick={() => setGuests((g) => ({ ...g, adults: g.adults - 1 }))}
                                className="w-8 h-8 rounded-full border border-airbnb-border flex items-center justify-center hover:border-airbnb-black disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-4 text-center">{guests.adults}</span>
                              <button
                                disabled={totalGuests >= (listing.guestCapacity || 8)}
                                onClick={() => setGuests((g) => ({ ...g, adults: g.adults + 1 }))}
                                className="w-8 h-8 rounded-full border border-airbnb-border flex items-center justify-center hover:border-airbnb-black disabled:opacity-30"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">Children</div>
                              <div className="text-xs text-airbnb-gray">Ages 2–12</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                disabled={guests.children <= 0}
                                onClick={() => setGuests((g) => ({ ...g, children: g.children - 1 }))}
                                className="w-8 h-8 rounded-full border border-airbnb-border flex items-center justify-center hover:border-airbnb-black disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold w-4 text-center">{guests.children}</span>
                              <button
                                disabled={totalGuests >= (listing.guestCapacity || 8)}
                                onClick={() => setGuests((g) => ({ ...g, children: g.children + 1 }))}
                                className="w-8 h-8 rounded-full border border-airbnb-border flex items-center justify-center hover:border-airbnb-black disabled:opacity-30"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 text-right">
                            <button
                              onClick={() => setIsGuestOpen(false)}
                              className="text-xs font-semibold underline text-airbnb-black"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Error Banner */}
                  {bookingStatus === 'error' && bookingErrorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Unable to submit reservation</div>
                        <div>{bookingErrorMessage}</div>
                      </div>
                    </div>
                  )}

                  {/* Booking Success Confirmation Banner */}
                  {bookingStatus === 'success' && bookingConfirmation && (
                    <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl space-y-1.5 shadow-sm">
                      <div className="flex items-center space-x-1.5 font-bold text-emerald-800 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Reservation request submitted</span>
                      </div>
                      <div className="text-emerald-700">
                        Code: <span className="font-mono font-semibold">{bookingConfirmation.confirmationCode}</span> · Status: <span className="font-semibold capitalize">{bookingConfirmation.booking?.status || 'pending'}</span>
                      </div>
                      <div className="text-emerald-600 text-[11px]">
                        Saved in MongoDB ({bookingConfirmation.booking?.nights} nights · ${bookingConfirmation.booking?.pricing?.totalPrice?.toLocaleString()})
                      </div>
                    </div>
                  )}

                  {/* Reserve Action Button */}
                  {bookingStatus === 'submitting' ? (
                    <button
                      disabled
                      className="w-full bg-slate-700 text-white font-semibold py-3.5 rounded-xl text-base shadow flex items-center justify-center space-x-2 cursor-wait opacity-90"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Submitting request...</span>
                    </button>
                  ) : bookingStatus === 'success' ? (
                    <button
                      onClick={handleReserve}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl text-base shadow-md transition flex items-center justify-center space-x-2 active:scale-[0.98]"
                      title="Reservation request submitted. Click to book again."
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>Reservation request submitted</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleReserve}
                      className="w-full bg-gradient-to-r from-brand via-[#E31C5F] to-brand-dark hover:brightness-105 text-white font-semibold py-3.5 rounded-xl text-base shadow-md transition active:scale-[0.98]"
                    >
                      Reserve
                    </button>
                  )}

                  <div className="text-center text-xs text-airbnb-gray my-3">
                    You won't be charged yet
                  </div>

                  {/* Dynamic Cost Breakdown directly from MongoDB fields */}
                  <div className="space-y-3 pt-3 text-sm text-airbnb-black">
                    <div className="flex justify-between">
                      <span className="underline">${nightlyRate} × {nights} nights</span>
                      <span>${basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Cleaning fee</span>
                      <span>${cleaningFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Airbnb service fee (14.2%)</span>
                      <span>${serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Taxes (8.5%)</span>
                      <span>${taxes.toLocaleString()}</span>
                    </div>

                    <div className="border-t border-airbnb-borderLight pt-4 flex justify-between font-bold text-base">
                      <span>Total before taxes & fees</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
