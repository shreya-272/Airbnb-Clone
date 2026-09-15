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
  Home,
  X,
  Trash2,
  Compass,
  LayoutDashboard,
  ArrowLeft,
  User,
  LogIn,
  LogOut,
  UserCheck
  ,Moon
  ,Sun
  ,ChevronLeft
  ,ChevronRight
  ,Maximize2
  ,CalendarDays
  ,Images
  ,Globe2
  ,HelpCircle
  ,ArrowUpRight
} from 'lucide-react';
import { useListing } from './api/listingApi.js';
import { checkFavoriteStatus, addFavorite, removeFavorite, fetchUserFavorites } from './api/favoriteApi.js';
import { submitBooking } from './api/bookingApi.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import ListingSkeleton from './components/ListingSkeleton.js';
import ReviewsSection from './components/ReviewsSection.js';
import ResortCatalog from './components/ResortCatalog.js';
import UserDashboard from './components/UserDashboard.js';
import AuthModal from './components/AuthModal.js';
import AuthPage from './components/AuthPage.js';
import HostDashboard from './components/HostDashboard.js';
import IndiaJourneys from './components/IndiaJourneys.js';

// Seeded listing ObjectId in MongoDB (Villa Paradiso canonical ID)
const DEFAULT_LISTING_ID = '6aa7d647bda80dd066fe3c61';

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

function AppContent() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('havenly_theme');
      return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const nextTheme = !current;
      localStorage.setItem('havenly_theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  // At first open only login and signup page if unauthenticated; otherwise open user dashboard
  const [currentView, setCurrentView] = useState(() => {
    try {
      return localStorage.getItem('airbnb_auth_token') ? 'dashboard' : 'auth';
    } catch {
      return 'auth';
    }
  });
  const [authPageTab, setAuthPageTab] = useState('login');
  const [selectedListingId, setSelectedListingId] = useState(DEFAULT_LISTING_ID);

  useEffect(() => {
    if (user?.role === 'host' || user?.role === 'admin') setCurrentView('host');
  }, [user?.role]);

  // Use custom hook to fetch listing from MongoDB with explicit error categories
  const { data: listing, loading, error, isNetworkError, isNotFound, refetch } = useListing(selectedListingId);

  // User interaction states
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);

  // Wishlist modal & list states
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  // Dates & Guests
  const [checkIn, setCheckIn] = useState('2026-10-12');
  const [checkOut, setCheckOut] = useState('2026-10-17');
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [isGuestOpen, setIsGuestOpen] = useState(false);

  // Booking states
  const [bookingStatus, setBookingStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingErrorMessage, setBookingErrorMessage] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Reset booking feedback when switching to a different resort
  useEffect(() => {
    setBookingStatus('idle');
    setBookingConfirmation(null);
    setBookingErrorMessage(null);
  }, [selectedListingId]);

  const handleSelectListing = (id) => {
    setSelectedListingId(id);
    setCurrentView('listing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize Favorite state from MongoDB when listing loads
  useEffect(() => {
    if (listing?._id) {
      checkFavoriteStatus(listing._id)
        .then((saved) => setIsWishlisted(saved))
        .catch((err) => console.error('[App] Error checking favorite status:', err));
    }
  }, [listing?._id]);

  // Load user favorites from MongoDB for Wishlist drawer
  const loadWishlist = async () => {
    setWishlistLoading(true);
    setWishlistError(null);
    try {
      const items = await fetchUserFavorites();
      setWishlistItems(items);
    } catch (err) {
      setWishlistError(err.message || 'Could not load your wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleOpenWishlist = () => {
    setIsWishlistOpen(true);
    loadWishlist();
  };

  const handleRemoveWishlistItem = async (targetListingId) => {
    try {
      await removeFavorite(targetListingId);
      setWishlistItems((prev) =>
        prev.filter((item) => (item.listingId?._id || item.listingId) !== targetListingId)
      );
      if (listing?._id === targetListingId) {
        setIsWishlisted(false);
      }
    } catch (err) {
      setFavoriteError(`Failed to remove favorite: ${err.message}`);
    }
  };

  // Handle favorite toggle synchronized with MongoDB & localStorage
  const handleToggleFavorite = async () => {
    if (!listing?._id || isSavingFavorite) return;

    const nextStatus = !isWishlisted;
    setIsWishlisted(nextStatus);
    setIsSavingFavorite(true);
    setFavoriteError(null);

    try {
      if (nextStatus) {
        await addFavorite(listing._id);
      } else {
        await removeFavorite(listing._id);
      }
    } catch (err) {
      console.error('[App] Failed to sync favorite with MongoDB:', err);
      // Rollback on network or server failure
      setIsWishlisted(!nextStatus);
      setFavoriteError(
        err.isNetworkError
          ? 'Network failure: your favorite was saved locally and will sync when you reconnect.'
          : err.message || 'Could not update favorite in database.'
      );
    } finally {
      setIsSavingFavorite(false);
    }
  };

  // Handle booking submission to MongoDB
  const handleReserve = async () => {
    if (!listing?._id || bookingStatus === 'submitting') return;

    // Client-side date validations
    if (!checkIn || !checkOut) {
      setBookingStatus('error');
      setBookingErrorMessage('Please select both check-in and checkout dates.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setBookingStatus('error');
      setBookingErrorMessage('Checkout date must be after check-in date.');
      return;
    }

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
  const nightlyRate = listing?.pricePerNightINR || Math.round((listing?.pricePerNight || 385) * 83);
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const basePrice = nightlyRate * nights;
  const cleaningFee = listing?.cleaningFeeINR || Math.round((listing?.cleaningFee || 150) * 83);
  const serviceFee = listing?.serviceFeeINR || Math.round((listing?.serviceFee || basePrice * 0.142) * (listing?.serviceFeeINR ? 1 : 83));
  const taxes = Math.round((basePrice + cleaningFee) * 0.085);
  const totalPrice = basePrice + cleaningFee + serviceFee + taxes;
  const totalGuests = guests.adults + guests.children;

  // Fallback images if not populated yet
  const listingImages = listing?.images?.length
    ? listing.images
    : [
        '/images/resorts/hotel-001.jpg',
        '/images/resorts/hotel-002.jpg',
        '/images/resorts/hotel-003.jpg',
        '/images/resorts/hotel-004.jpg',
        '/images/resorts/hotel-005.jpg',
      ];


  return (
    <div className={`min-h-screen bg-white text-airbnb-black font-sans ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Global Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-airbnb-borderLight shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('explore')}
            className="flex items-center space-x-2 cursor-pointer group"
            title="Return to resort catalog"
          >
            <svg className="h-8 w-auto text-brand transition-transform group-hover:scale-105" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.328l.011.389c0 4.002-3.136 7.2-7.1 7.2-2.146 0-4.095-.944-5.4-2.483-1.305 1.539-3.254 2.483-5.4 2.483-3.964 0-7.1-3.198-7.1-7.2 0-1.127.311-2.316.971-3.717l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.328 0-2.348.647-3.414 2.545l-.547 1.054c-1.94 3.8-6.096 12.5-7.067 14.763l-.135.332c-.596 1.264-.837 2.227-.837 3.106 0 2.871 2.228 5.2 5.1 5.2 1.776 0 3.447-.94 4.382-2.463l.518-.847.518.847c.935 1.523 2.606 2.463 4.382 2.463 2.872 0 5.1-2.329 5.1-5.2 0-.879-.241-1.842-.837-3.106l-.135-.332c-.971-2.263-5.127-10.963-7.067-14.763l-.547-1.054C18.348 3.647 17.328 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.905-1.332 3.498-3.103 3.899l-.297.049-.6.052c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .977.701 1.79 1.636 1.967l.178.024.186.009c1.105 0 2-.895 2-2 0-1.105-.895-2-2-2z" />
            </svg>
            <span className="text-xl font-extrabold text-brand tracking-tight hidden sm:inline">havenly</span>
          </div>

          {/* Primary View Switcher Navigation Pills */}
          <nav aria-label="Main Navigation" className="flex items-center bg-airbnb-bgSubtle p-1 rounded-full border border-airbnb-border shadow-xs text-xs font-semibold">
            <button
              onClick={() => setCurrentView('explore')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full transition cursor-pointer ${
                currentView === 'explore'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover stays</span>
            </button>
            <button
              onClick={() => setCurrentView('journeys')}
              className={`hidden md:flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full transition cursor-pointer ${
                currentView === 'journeys'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>India journeys</span>
            </button>
            <button
              onClick={() => setCurrentView('listing')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full transition cursor-pointer ${
                currentView === 'listing'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Your stay</span>
              <span className="sm:hidden">Details</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Trips</span>
            </button>

            {isAuthenticated && (user?.role === 'host' || user?.role === 'admin') && (
              <button
                onClick={() => setCurrentView('host')}
                className={`hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-full transition cursor-pointer text-xs font-semibold ${currentView === 'host' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-airbnb-bgSubtle text-airbnb-black'}`}
              >
                <Briefcase className="w-4 h-4 text-brand" />
                <span>Host studio</span>
              </button>
            )}
          </nav>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-sm font-medium">
            <button
              onClick={toggleTheme}
              className="theme-toggle flex items-center justify-center w-9 h-9 rounded-full border border-airbnb-border hover:bg-airbnb-bgSubtle transition active:scale-95"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-airbnb-black" />}
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full transition cursor-pointer text-xs font-semibold ${
                currentView === 'dashboard'
                  ? 'bg-brand/10 text-brand font-bold'
                  : 'hover:bg-airbnb-bgSubtle text-airbnb-black'
              }`}
              title="Open User Dashboard"
            >
              <User className="w-4 h-4 text-brand" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={handleOpenWishlist}
              className="flex items-center space-x-1.5 hover:bg-airbnb-bgSubtle px-3 py-2 rounded-full transition cursor-pointer text-airbnb-black text-xs font-semibold"
              title="View your saved favorites"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-brand text-brand' : 'text-airbnb-black'}`} />
              <span className="hidden sm:inline">Wishlist</span>
            </button>

            {/* Auth Buttons or User Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 border border-airbnb-border hover:shadow-md transition rounded-full p-1.5 pl-2.5 cursor-pointer"
                  title="Account menu"
                >
                  <span className="text-xs font-bold text-airbnb-black hidden lg:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={user?.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-airbnb-gray" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-airbnb-border rounded-2xl shadow-dropdown py-2 z-40 animate-scale-up"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-airbnb-borderLight">
                      <div className="font-bold text-xs text-airbnb-black truncate">{user?.name}</div>
                      <div className="text-[11px] text-airbnb-gray truncate">{user?.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-airbnb-bgSubtle flex items-center space-x-2 text-airbnb-black cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-airbnb-gray" />
                      <span>User Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        handleOpenWishlist();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-airbnb-bgSubtle flex items-center space-x-2 text-airbnb-black cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-airbnb-gray" />
                      <span>Saved Wishlists</span>
                    </button>

                    <div className="border-t border-airbnb-borderLight my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setCurrentView('auth');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-bold text-airbnb-black hover:bg-airbnb-bgSubtle px-3 py-2 rounded-full transition cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="text-xs font-bold bg-brand hover:bg-brand-hover text-white px-3.5 py-2 rounded-full shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main View Router */}
      {currentView === 'explore' ? (
        <ResortCatalog onSelectListing={handleSelectListing} />
      ) : currentView === 'journeys' ? (
        <IndiaJourneys onSelectListing={handleSelectListing} />
      ) : currentView === 'host' ? (
        <HostDashboard onExplore={() => setCurrentView('explore')} />
      ) : currentView === 'dashboard' ? (
        <UserDashboard
          onSelectListing={handleSelectListing}
          onExplore={() => setCurrentView('explore')}
        />
      ) : currentView === 'auth' ? (
        <AuthPage
          defaultTab={authPageTab}
          onComplete={() => setCurrentView('dashboard')}
          onBack={() => setCurrentView('explore')}
        />
      ) : (
        /* Single Resort Detail View */
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {/* Breadcrumb Back Button */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('explore')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-airbnb-gray hover:text-airbnb-black transition group py-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-airbnb-black" />
              <span>Back to all luxury resorts</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Resort ID: {selectedListingId}
              </span>
            </div>
          </div>

          {/* Loading State: Skeleton */}
          {loading ? (
            <ListingSkeleton />
          ) : isNotFound ? (
            /* 404 Listing Not Found State */
            <div className="my-16 text-center max-w-lg mx-auto p-8 border border-amber-200 bg-amber-50/70 rounded-2xl shadow-sm space-y-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <Home className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-900">Listing Not Found (404)</h2>
                <p className="text-xs text-amber-700 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  This stay may have been unpublished or removed. Try exploring another destination.
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setCurrentView('explore')}
                  className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95 cursor-pointer"
                >
                  Explore Other Resorts
                </button>
                <button
                  onClick={refetch}
                  className="border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            </div>
        ) : isNetworkError ? (
          /* Network Connection Failure State */
          <div className="my-16 text-center max-w-lg mx-auto p-8 border border-rose-200 bg-rose-50/70 rounded-2xl shadow-sm space-y-4">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <Wifi className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-rose-900">Backend Server Unreachable</h2>
              <p className="text-xs text-rose-700 mt-1.5 max-w-sm mx-auto leading-relaxed">
                We couldn't load this stay right now. Please check your connection and try again.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={refetch}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : error ? (
          /* Generic Error State */
          <div className="my-16 text-center max-w-lg mx-auto p-8 border border-rose-200 bg-rose-50 rounded-2xl shadow-sm space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-rose-900">Failed to Load Listing</h2>
              <p className="text-xs text-rose-700 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95"
            >
              Try Again
            </button>
          </div>
        ) : !listing ? (
          /* Empty Listing State */
          <div className="my-16 text-center max-w-lg mx-auto p-8 border border-dashed border-slate-300 bg-slate-50 rounded-2xl shadow-sm space-y-4">
            <Home className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">No Listing Available</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">No listing document was returned from the database.</p>
            </div>
            <button
              onClick={refetch}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95"
            >
              Reload Listing
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

                <div className="flex items-center space-x-3">
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
                  <button
                    onClick={handleOpenWishlist}
                    className="text-xs font-semibold text-airbnb-gray hover:text-airbnb-black underline hidden sm:inline"
                    title="View all saved wishlist items"
                  >
                    (View all)
                  </button>
                </div>
              </div>
            </section>

            {/* 5-Photo Bento Gallery Grid */}
            <section className="relative rounded-2xl overflow-hidden mb-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-72 sm:h-[420px]">
                {/* Main Hero Photo (images[0]) */}
                <div onClick={() => { setGalleryIndex(0); setIsGalleryOpen(true); }} className="md:col-span-2 relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 1 (images[1]) */}
                <div onClick={() => { setGalleryIndex(1); setIsGalleryOpen(true); }} className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[1] || listingImages[0]}
                    alt="Property detail 1"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 2 (images[2]) */}
                <div onClick={() => { setGalleryIndex(2); setIsGalleryOpen(true); }} className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[2] || listingImages[0]}
                    alt="Property detail 2"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 3 (images[3]) */}
                <div onClick={() => { setGalleryIndex(3); setIsGalleryOpen(true); }} className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[3] || listingImages[0]}
                    alt="Property detail 3"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>

                {/* Quadrant Photo 4 (images[4]) */}
                <div onClick={() => { setGalleryIndex(4); setIsGalleryOpen(true); }} className="hidden md:block relative overflow-hidden group cursor-pointer">
                  <img
                    src={listingImages[4] || listingImages[0]}
                    alt="Property detail 4"
                    className="w-full h-full object-cover transition duration-300 group-hover:brightness-90"
                  />
                </div>
              </div>

              <button onClick={() => { setGalleryIndex(0); setIsGalleryOpen(true); }} className="absolute bottom-5 right-5 bg-white text-airbnb-black font-semibold text-sm px-4 py-2 rounded-lg border border-airbnb-black shadow-md hover:bg-airbnb-bgSubtle transition flex items-center space-x-2">
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
                      {listing.guestCapacity} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths · {listing.host?.responseRate || '98%'} response rate
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
                      One of the most loved homes in our collection based on ratings, reviews, and reliability.
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
                        <span className="text-2xl font-bold text-airbnb-black">₹{nightlyRate.toLocaleString('en-IN')}</span>
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
                          min={new Date().toISOString().slice(0, 10)}
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
                          min={checkIn}
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

                  <div className="mb-4 rounded-xl border border-airbnb-border bg-airbnb-bgSubtle/40 p-3">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-airbnb-black"><span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-brand" />Quick availability</span><span className="font-normal normal-case text-airbnb-gray">Select check-in, then checkout</span></div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: 14 }, (_, index) => {
                        const day = new Date();
                        day.setHours(12, 0, 0, 0);
                        day.setDate(day.getDate() + index);
                        const value = day.toISOString().slice(0, 10);
                        const selected = value === checkIn || value === checkOut;
                        return <button key={value} type="button" onClick={() => value > checkIn ? setCheckOut(value) : setCheckIn(value)} className={`rounded-lg px-1 py-2 text-center transition ${selected ? 'bg-brand text-white' : 'bg-white text-airbnb-black hover:bg-brand/10'}`}><span className="block text-[9px] text-current/60">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span><span className="text-xs font-bold">{day.getDate()}</span></button>;
                      })}
                    </div>
                  </div>

                  {/* Booking Error Banner */}
                  {bookingStatus === 'error' && bookingErrorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start justify-between space-x-2">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Unable to submit reservation</div>
                          <div>{bookingErrorMessage}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBookingStatus('idle');
                          setBookingErrorMessage(null);
                        }}
                        className="text-rose-500 hover:text-rose-800 p-0.5 transition"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Booking Success Confirmation Banner */}
                  {bookingStatus === 'success' && bookingConfirmation && (
                    <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-bold text-emerald-800 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Reservation request submitted</span>
                        </div>
                        <button
                          onClick={() => {
                            setBookingStatus('idle');
                            setBookingConfirmation(null);
                          }}
                          className="text-[11px] font-semibold underline text-emerald-700 hover:text-emerald-900"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="text-emerald-700">
                        Code: <span className="font-mono font-semibold">{bookingConfirmation.confirmationCode}</span> · Status: <span className="font-semibold capitalize">{bookingConfirmation.booking?.status || 'pending'}</span>
                      </div>
                      <div className="text-emerald-600 text-[11px]">
                        Saved to your trips ({bookingConfirmation.booking?.nights} nights · ₹{(bookingConfirmation.booking?.pricing?.totalPriceINR || 0).toLocaleString('en-IN')})
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
                      onClick={() => setIsCheckoutOpen(true)}
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
                      <span className="underline">₹{nightlyRate.toLocaleString('en-IN')} × {nights} nights</span>
                      <span>₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Cleaning fee</span>
                      <span>₹{cleaningFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Service fee (14.2%)</span>
                      <span>₹{serviceFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Taxes (8.5%)</span>
                      <span>₹{taxes.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="border-t border-airbnb-borderLight pt-4 flex justify-between font-bold text-base">
                      <span>Total before taxes & fees</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extended Reviews Section from MongoDB */}
            <ReviewsSection listingId={listing._id} onReviewAdded={() => refetch()} />
          </>
        ) : null}
        </main>
      )}

      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Photo gallery">
          <button onClick={() => setIsGalleryOpen(false)} className="absolute right-5 top-5 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" title="Close gallery"><X className="h-5 w-5" /></button>
          <div className="flex w-full max-w-6xl flex-col items-center gap-5">
            <div className="relative flex h-[58vh] w-full items-center justify-center sm:h-[70vh]">
              <img src={listingImages[galleryIndex] || listingImages[0]} alt={`${listing.title} photo ${galleryIndex + 1}`} className="max-h-full max-w-full rounded-2xl object-contain shadow-floating" />
              <button onClick={() => setGalleryIndex((index) => (index - 1 + listingImages.length) % listingImages.length)} className="absolute left-2 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 sm:left-6" title="Previous photo"><ChevronLeft className="h-6 w-6" /></button>
              <button onClick={() => setGalleryIndex((index) => (index + 1) % listingImages.length)} className="absolute right-2 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 sm:right-6" title="Next photo"><ChevronRight className="h-6 w-6" /></button>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {listingImages.map((image, index) => <button key={image + index} onClick={() => setGalleryIndex(index)} className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${galleryIndex === index ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" /></button>)}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70"><Maximize2 className="h-3.5 w-3.5" />{galleryIndex + 1} / {listingImages.length} photos</div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-floating">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Secure checkout</p><h2 className="mt-1 text-2xl font-bold text-airbnb-black">Review your stay</h2><p className="mt-1 text-xs text-airbnb-gray">No payment is captured in this demo checkout.</p></div><button onClick={() => setIsCheckoutOpen(false)} className="rounded-full p-2 text-airbnb-gray hover:bg-airbnb-bgSubtle"><X className="h-5 w-5" /></button></div>
            <div className="mt-5 flex gap-3 rounded-2xl border border-airbnb-border bg-airbnb-bgSubtle/40 p-3"><img src={listingImages[0]} alt={listing.title} className="h-20 w-24 rounded-xl object-cover" /><div><h3 className="text-sm font-bold text-airbnb-black">{listing.title}</h3><p className="mt-1 text-xs text-airbnb-gray">{checkIn} to {checkOut} · {totalGuests} guests</p><p className="mt-2 text-xs font-bold text-airbnb-black">₹{nightlyRate.toLocaleString('en-IN')} × {nights} nights</p></div></div>
            <div className="mt-5 space-y-3 border-t border-airbnb-borderLight pt-4 text-sm text-airbnb-black"><div className="flex justify-between"><span>Stay</span><span>₹{basePrice.toLocaleString('en-IN')}</span></div><div className="flex justify-between"><span>Cleaning and service</span><span>₹{(cleaningFee + serviceFee).toLocaleString('en-IN')}</span></div><div className="flex justify-between"><span>Taxes</span><span>₹{taxes.toLocaleString('en-IN')}</span></div><div className="flex justify-between border-t border-airbnb-borderLight pt-3 font-bold"><span>Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div></div>
            <button onClick={() => { setIsCheckoutOpen(false); handleReserve(); }} className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-hover">Confirm reservation request</button>
          </div>
        </div>
      )}

      {/* Floating Favorite Error Toast */}
      {favoriteError && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-slide-up max-w-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="leading-snug">{favoriteError}</span>
          <button
            onClick={() => setFavoriteError(null)}
            className="text-slate-400 hover:text-white ml-2 flex-shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Wishlist / Favorites Modal */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-airbnb-border overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-airbnb-borderLight flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 fill-brand text-brand" />
                <h3 className="font-bold text-base text-airbnb-black">Saved Wishlist</h3>
                <span className="text-[11px] font-semibold bg-airbnb-bgSubtle px-2 py-0.5 rounded-full text-airbnb-gray">
                  Up to date
                </span>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1 rounded-full hover:bg-airbnb-bgSubtle text-airbnb-gray hover:text-airbnb-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {wishlistLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex space-x-3 items-center">
                      <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : wishlistError ? (
                /* Favorites Error State */
                <div className="p-6 text-center border border-rose-200 bg-rose-50/70 rounded-xl space-y-3">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="font-semibold text-rose-900 text-sm">Unable to Load Wishlist</h4>
                  <p className="text-xs text-rose-700 leading-relaxed">{wishlistError}</p>
                  <button
                    onClick={loadWishlist}
                    className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              ) : wishlistItems.length === 0 ? (
                /* Empty Favorites State */
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-brand">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-airbnb-black">Your wishlist is empty</h4>
                  <p className="text-xs text-airbnb-gray max-w-xs mx-auto leading-relaxed">
                    As you browse listings, tap the heart icon on any home to save it to your personal wishlist.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsWishlistOpen(false)}
                      className="bg-airbnb-black hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
                    >
                      Browse Listings
                    </button>
                  </div>
                </div>
              ) : (
                /* Populated Favorites List */
                <div className="space-y-3">
                  {wishlistItems.map((fav) => {
                    const itemListing = fav.listingId || {};
                    const itemListingId = itemListing._id || fav.listingId;
                    const imgUrl =
                      itemListing.images?.[0] ||
                      '/images/resorts/hotel-001.jpg';

                    return (
                      <div
                        key={fav._id}
                        onClick={() => {
                          handleSelectListing(itemListingId);
                          setIsWishlistOpen(false);
                        }}
                        className="flex items-center space-x-4 p-3 border border-airbnb-border rounded-xl hover:bg-airbnb-bgSubtle/50 transition group cursor-pointer"
                        title="Click to view resort details"
                      >
                        <img
                          src={imgUrl}
                          alt={itemListing.title || 'Saved Listing'}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = '/images/resorts/hotel-001.jpg';
                          }}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-sm text-airbnb-black truncate group-hover:text-brand transition">
                            {itemListing.title || 'Villa Paradiso'}
                          </h5>
                          <p className="text-xs text-airbnb-gray truncate mt-0.5">
                            {itemListing.location?.city || 'Udaipur'}, India
                          </p>
                          <p className="text-xs font-bold text-airbnb-black mt-1">
                            ₹{(itemListing.pricePerNightINR || itemListing.pricePerNight * 83 || 385 * 83).toLocaleString('en-IN')} <span className="font-normal text-airbnb-gray">/ night</span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWishlistItem(itemListingId);
                          }}
                          className="p-2 text-airbnb-gray hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-airbnb-borderLight bg-airbnb-bgSubtle/40 flex items-center justify-between text-xs text-airbnb-gray">
              <span>{wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}</span>
              <button
                onClick={loadWishlist}
                disabled={wishlistLoading}
                className="flex items-center space-x-1 hover:text-airbnb-black transition"
              >
                <RefreshCw className={`w-3 h-3 ${wishlistLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-airbnb-borderLight bg-airbnb-bgSubtle/60 px-4 py-10 text-airbnb-gray sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3"><div className="flex items-center gap-2 text-brand"><span className="text-lg font-extrabold">havenly</span></div><p className="max-w-xs text-xs leading-5">Thoughtful stays for the places, people, and moments worth remembering.</p></div>
          <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-airbnb-black">Explore</h3><div className="mt-4 space-y-3 text-xs"><button onClick={() => setCurrentView('explore')} className="block hover:text-brand">Discover stays</button><button onClick={() => setCurrentView('listing')} className="block hover:text-brand">Featured stay</button><button onClick={() => setCurrentView('dashboard')} className="block hover:text-brand">Your trips</button></div></div>
          <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-airbnb-black">Hosting</h3><div className="mt-4 space-y-3 text-xs"><button onClick={() => isAuthenticated ? setCurrentView('host') : openAuthModal('login')} className="flex items-center gap-1 hover:text-brand">Host your home <ArrowUpRight className="h-3 w-3" /></button><button onClick={() => setCurrentView('dashboard')} className="block hover:text-brand">Host resources</button><button onClick={() => openAuthModal('login')} className="block hover:text-brand">Sign in</button></div></div>
          <div><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-airbnb-black">Stay connected</h3><div className="mt-4 space-y-3 text-xs"><button className="flex items-center gap-2 hover:text-brand"><HelpCircle className="h-3.5 w-3.5" />Help center</button><button className="flex items-center gap-2 hover:text-brand"><Globe2 className="h-3.5 w-3.5" />English · INR ₹</button><p>Made for curious travelers.</p></div></div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-airbnb-borderLight pt-5 text-[11px] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 havenly. All rights reserved.</span><div className="flex gap-4"><button className="hover:text-brand">Privacy</button><button className="hover:text-brand">Terms</button><button className="hover:text-brand">Sitemap</button></div></div>
      </footer>

      {/* Global Auth Modal for Login and Signup */}
      <AuthModal onAuthSuccess={() => setCurrentView('dashboard')} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
