import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Heart,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Compass,
  User,
  ShieldCheck,
  CreditCard,
  Bell,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LogIn,
  Edit3,
  Save,
  X,
  Phone,
  FileText
  ,FolderPlus
  ,Plus
  ,MessageCircle
} from 'lucide-react';
import { fetchUserBookings, cancelBooking } from '../api/bookingApi.js';
import { fetchUserFavorites, removeFavorite } from '../api/favoriteApi.js';
import { useAuth } from '../context/AuthContext.js';
import { fetchMessages, fetchNotifications, markNotificationsRead } from '../api/communicationApi.js';
import { changePasswordApi } from '../api/authApi.js';

export default function UserDashboard({ onSelectListing, onExplore }) {
  const { user, isAuthenticated, openAuthModal, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'wishlist' | 'messages' | 'reviews' | 'settings'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Profile edit modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState(null);

  const handleOpenEditProfile = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditBio(user?.bio || '');
    setProfileSaveSuccess(false);
    setProfileSaveError(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(false);
    try {
      await updateUserProfile({
        name: editName,
        phone: editPhone,
        bio: editBio,
      });
      setProfileSaveSuccess(true);
      setTimeout(() => {
        setIsEditingProfile(false);
      }, 900);
    } catch (err) {
      setProfileSaveError(err.message || 'Failed to update profile in database');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState('All saved');
  const [newCollectionName, setNewCollectionName] = useState('');

  // Currency & Settings state
  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    try {
      setCollections(JSON.parse(localStorage.getItem('havenly_wishlist_collections') || '[]'));
    } catch {
      setCollections([]);
    }
  }, []);

  const createCollection = (event) => {
    event.preventDefault();
    const name = newCollectionName.trim();
    if (!name || collections.some((collection) => collection.name.toLowerCase() === name.toLowerCase())) return;
    const next = [...collections, { name, listingIds: [] }];
    setCollections(next);
    setNewCollectionName('');
    setActiveCollection(name);
    localStorage.setItem('havenly_wishlist_collections', JSON.stringify(next));
  };

  const addToCollection = (listingId) => {
    if (activeCollection === 'All saved') return;
    const next = collections.map((collection) => collection.name === activeCollection && !collection.listingIds.includes(listingId)
      ? { ...collection, listingIds: [...collection.listingIds, listingId] }
      : collection);
    setCollections(next);
    localStorage.setItem('havenly_wishlist_collections', JSON.stringify(next));
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const data = await fetchUserBookings();
      setBookings(data);
    } catch (err) {
      setBookingsError(err.message || 'Unable to load your reservations');
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadFavorites = async () => {
    setFavoritesLoading(true);
    setFavoritesError(null);
    try {
      const data = await fetchUserFavorites();
      setFavorites(data);
    } catch (err) {
      setFavoritesError(err.message || 'Unable to load your favorites');
    } finally {
      setFavoritesLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    loadFavorites();
    if (isAuthenticated) {
      fetchMessages().then((result) => setMessages(result.data || [])).catch(() => {});
      fetchNotifications().then((result) => setNotificationsList(result.data || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  const unreadNotifications = notificationsList.filter((notification) => !notification.readAt).length;
  const handleMarkNotificationsRead = async () => {

      const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordMessage('');
        setPasswordError('');
        try {
          await changePasswordApi({ currentPassword, newPassword });
          setCurrentPassword('');
          setNewPassword('');
          setPasswordMessage('Password changed successfully.');
        } catch (error) {
          setPasswordError(error.message);
        }
      };
    await markNotificationsRead().catch(() => {});
    setNotificationsList((current) => current.map((notification) => ({ ...notification, readAt: new Date().toISOString() })));
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      // Update local state to cancelled
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      alert('Error cancelling booking: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleRemoveFavorite = async (targetListingId) => {
    try {
      await removeFavorite(targetListingId);
      setFavorites((prev) =>
        prev.filter((f) => (f.listingId?._id || f.listingId) !== targetListingId)
      );
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const visibleFavorites = activeCollection === 'All saved'
    ? favorites
    : favorites.filter((favorite) => collections.find((collection) => collection.name === activeCollection)?.listingIds.includes(favorite.listingId?._id || favorite.listingId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in">
      {/* User Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
                }
                alt={user?.name || 'Guest User'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-white/20 shadow-md"
              />
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  isAuthenticated ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                title={isAuthenticated ? 'Logged in' : 'Guest Session'}
              ></span>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Welcome, Traveler!'}
                </h1>
                <span className="bg-brand text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {user?.role ? `${user.role} Member` : 'Guest Session'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {user?.email || 'Browse resorts anonymously or sign in to save your favorites'} · Member since{' '}
                {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAuthenticated ? 'Identity Verified' : 'Standard Guest'}</span>
                </span>
                <span>·</span>
                <span>Member account active</span>
                {!isAuthenticated ? (
                  <>
                    <span>·</span>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="text-brand font-bold underline hover:text-white transition cursor-pointer"
                    >
                      Log in now
                    </button>
                  </>
                ) : (
                  <>
                    <span>·</span>
                    <button
                      onClick={logout}
                      className="text-slate-400 hover:text-rose-400 underline transition cursor-pointer"
                    >
                      Log out
                    </button>
                    <span>·</span>
                    <button
                      onClick={handleOpenEditProfile}
                      className="inline-flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/20 transition cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3 h-3 text-brand" />
                      <span>Edit Profile & Photo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 sm:space-x-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 text-center flex-1 md:flex-initial">
              <div className="text-xl font-extrabold text-white">{bookings.length}</div>
              <div className="text-[11px] text-slate-300 font-medium">Total Trips</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 text-center flex-1 md:flex-initial">
              <div className="text-xl font-extrabold text-white">{favorites.length}</div>
              <div className="text-[11px] text-slate-300 font-medium">Saved Resorts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 text-center flex-1 md:flex-initial">
              <div className="text-xl font-extrabold text-white">6</div>
              <div className="text-[11px] text-slate-300 font-medium">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-airbnb-borderLight mb-8 overflow-x-auto">
        <div className="flex space-x-6 sm:space-x-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center space-x-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-brand text-brand'
                : 'border-transparent text-airbnb-gray hover:text-airbnb-black'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings & Trips</span>
            {confirmedCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {confirmedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center space-x-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'border-brand text-brand'
                : 'border-transparent text-airbnb-gray hover:text-airbnb-black'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlists</span>
            {favorites.length > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center space-x-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'messages' ? 'border-brand text-brand' : 'border-transparent text-airbnb-gray hover:text-airbnb-black'}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Messages</span>
            {messages.length > 0 && <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{messages.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center space-x-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-brand text-brand'
                : 'border-transparent text-airbnb-gray hover:text-airbnb-black'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>My Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-brand text-brand'
                : 'border-transparent text-airbnb-gray hover:text-airbnb-black'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>

        <button
          onClick={onExplore}
          className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-brand hover:underline"
        >
          <Compass className="w-4 h-4" />
          <span>Explore All 12+ Resorts</span>
        </button>
      </div>

      {/* Tab 1: Bookings & Trips */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-airbnb-black">Upcoming & Past Reservations</h2>
            <button
              onClick={loadBookings}
              disabled={bookingsLoading}
              className="flex items-center space-x-1.5 text-xs text-airbnb-gray hover:text-airbnb-black transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {bookingsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 bg-slate-100 rounded-2xl border border-slate-200"></div>
              ))}
            </div>
          ) : bookingsError ? (
            <div className="p-8 border border-rose-200 bg-rose-50 rounded-2xl text-center max-w-lg mx-auto space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-semibold text-rose-900 text-sm">Failed to Load Bookings</h3>
              <p className="text-xs text-rose-700">{bookingsError}</p>
              <button
                onClick={loadBookings}
                className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-airbnb-border rounded-3xl bg-airbnb-bgSubtle/40 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-white border border-airbnb-border rounded-full flex items-center justify-center mx-auto text-airbnb-gray shadow-sm">
                <Calendar className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-airbnb-black">No trips booked... yet!</h3>
                <p className="text-xs text-airbnb-gray mt-1 max-w-xs mx-auto leading-relaxed">
                  Time to dust off your bags and start planning your next getaway across our 12+ luxury resorts.
                </p>
              </div>
              <button
                onClick={onExplore}
                className="inline-flex items-center space-x-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Start Searching Resorts</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const listing = booking.listingId || {};
                const coverImage =
                  listing.images?.[0] ||
                  '/images/resorts/hotel-001.jpg';

                const checkInFormatted = booking.checkIn
                  ? new Date(booking.checkIn).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Flexible';

                const checkOutFormatted = booking.checkOut
                  ? new Date(booking.checkOut).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Flexible';

                const confirmationCode = `HM-${booking._id.toString().slice(-6).toUpperCase()}`;

                return (
                  <div
                    key={booking._id}
                    className="p-4 sm:p-5 border border-airbnb-border rounded-2xl bg-white hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center space-x-4 min-w-0">
                      <img
                        src={coverImage}
                        alt={listing.title || 'Resort'}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-600 line-through'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {booking.status || 'pending'}
                          </span>
                          <span className="font-mono text-[11px] text-airbnb-gray">
                            Code: {confirmationCode}
                          </span>
                        </div>

                        <h3
                          onClick={() => listing._id && onSelectListing(listing._id)}
                          className="font-bold text-base text-airbnb-black hover:text-brand cursor-pointer transition truncate"
                        >
                          {listing.title || 'Luxury Resort Stay'}
                        </h3>

                        <p className="text-xs text-airbnb-gray flex items-center space-x-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {listing.location?.city ? `${listing.location.city}, ` : ''}
                            India
                          </span>
                        </p>

                        <div className="text-xs text-slate-700 flex items-center space-x-2 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-airbnb-gray" />
                          <span className="font-medium">
                            {checkInFormatted} – {checkOutFormatted}
                          </span>
                          <span>·</span>
                          <span>{booking.guests?.total || 2} guests</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-airbnb-borderLight gap-3">
                      <div className="text-left md:text-right">
                        <div className="text-lg font-bold text-airbnb-black">
                          ₹{(booking.totalPriceINR || booking.totalPrice * 83 || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-airbnb-gray">Total paid · Confirmed trip</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {listing._id && (
                          <button
                            onClick={() => onSelectListing(listing._id)}
                            className="text-xs font-semibold text-airbnb-black hover:bg-airbnb-bgSubtle px-3 py-1.5 rounded-lg border border-airbnb-border transition flex items-center space-x-1"
                          >
                            <span>View Resort</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-lg sm:text-xl font-bold text-airbnb-black">Your Saved Resorts</h2><p className="mt-1 text-xs text-airbnb-gray">Organize your next escapes into collections.</p></div>
            <div className="flex items-center gap-2"><button onClick={loadFavorites} disabled={favoritesLoading} className="flex items-center space-x-1.5 text-xs text-airbnb-gray hover:text-airbnb-black transition"><RefreshCw className={`w-3.5 h-3.5 ${favoritesLoading ? 'animate-spin' : ''}`} /><span>Refresh</span></button></div>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-airbnb-border bg-airbnb-bgSubtle/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setActiveCollection('All saved')} className={`rounded-full px-3 py-2 text-xs font-bold transition ${activeCollection === 'All saved' ? 'bg-[#24332f] text-white' : 'bg-white text-airbnb-gray hover:bg-airbnb-bgSubtle'}`}>All saved</button>
              {collections.map((collection) => <button key={collection.name} onClick={() => setActiveCollection(collection.name)} className={`rounded-full px-3 py-2 text-xs font-bold transition ${activeCollection === collection.name ? 'bg-brand text-white' : 'bg-white text-airbnb-gray hover:bg-airbnb-bgSubtle'}`}>{collection.name} <span className="ml-1 opacity-60">{collection.listingIds.length}</span></button>)}
            </div>
            <form onSubmit={createCollection} className="flex items-center gap-2"><input value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} placeholder="New collection" className="w-32 rounded-full border border-airbnb-border bg-white px-3 py-2 text-xs outline-none sm:w-40" /><button type="submit" className="flex items-center gap-1 rounded-full bg-brand px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-hover"><FolderPlus className="h-3.5 w-3.5" />Create</button></form>
          </div>

          {favoritesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-2xl"></div>
              ))}
            </div>
          ) : favoritesError ? (
            <div className="p-8 border border-rose-200 bg-rose-50 rounded-2xl text-center max-w-lg mx-auto space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-semibold text-rose-900 text-sm">Failed to Load Wishlist</h3>
              <p className="text-xs text-rose-700">{favoritesError}</p>
            </div>
          ) : visibleFavorites.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-airbnb-border rounded-3xl bg-airbnb-bgSubtle/40 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-brand shadow-sm">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-airbnb-black">Your wishlist is empty</h3>
                <p className="text-xs text-airbnb-gray mt-1 max-w-xs mx-auto leading-relaxed">
                  Tap the heart icon on any of the 12+ luxury resorts to save them here for quick booking.
                </p>
              </div>
              <button
                onClick={onExplore}
                className="inline-flex items-center space-x-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Browse All Resorts</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleFavorites.map((fav) => {
                const listing = fav.listingId || {};
                const listingId = listing._id || fav.listingId;
                const coverImage =
                  listing.images?.[0] ||
                  '/images/resorts/hotel-001.jpg';

                return (
                  <div
                    key={fav._id}
                    className="border border-airbnb-border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition group flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={coverImage}
                        alt={listing.title || 'Resort'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <button
                        onClick={() => handleRemoveFavorite(listingId)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-full text-brand shadow hover:scale-110 transition"
                        title="Remove from favorites"
                      >
                        <Heart className="w-4 h-4 fill-brand text-brand" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-airbnb-gray">
                            {listing.location?.city}, {listing.location?.country}
                          </span>
                          <span className="flex items-center font-bold text-airbnb-black">
                            <Star className="w-3.5 h-3.5 fill-airbnb-black mr-1" />
                            {listing.rating || '5.0'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-airbnb-black line-clamp-1">
                          {listing.title || 'Luxury Resort'}
                        </h4>
                        <p className="text-xs text-airbnb-black font-bold mt-1">
                          ₹{(listing.pricePerNightINR || listing.pricePerNight * 83 || 385 * 83).toLocaleString('en-IN')} <span className="font-normal text-airbnb-gray">/ night</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-airbnb-borderLight flex items-center justify-between">
                        <button onClick={() => addToCollection(listingId)} className="mr-2 flex items-center gap-1 rounded-lg border border-airbnb-border px-2 py-2 text-[10px] font-bold text-airbnb-gray hover:bg-airbnb-bgSubtle" title="Add to selected collection"><Plus className="h-3 w-3" />Save</button>
                        <button
                          onClick={() => onSelectListing(listingId)}
                          className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 rounded-xl transition text-center"
                        >
                          Book Stay
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center justify-between"><div><h2 className="text-lg sm:text-xl font-bold text-airbnb-black">Messages</h2><p className="mt-1 text-xs text-airbnb-gray">Keep every host conversation in one place.</p></div><button onClick={handleMarkNotificationsRead} className="flex items-center gap-1.5 rounded-full border border-airbnb-border px-3 py-2 text-xs font-semibold text-airbnb-gray hover:bg-airbnb-bgSubtle"><Bell className="h-3.5 w-3.5" />{unreadNotifications} notifications</button></div>
          {notificationsList.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"><div className="font-bold">Latest updates</div>{notificationsList.slice(0, 3).map((notification) => <p key={notification._id} className="mt-1">{notification.title}: {notification.body}</p>)}</div>}
          <div className="space-y-3">{messages.length === 0 ? <div className="rounded-2xl border border-dashed border-airbnb-border p-10 text-center"><MessageCircle className="mx-auto h-8 w-8 text-airbnb-gray" /><p className="mt-3 text-sm font-bold text-airbnb-black">No messages yet</p><p className="mt-1 text-xs text-airbnb-gray">Host conversations will appear here.</p></div> : messages.map((message) => <div key={message._id} className="rounded-2xl border border-airbnb-border bg-white p-4"><div className="flex items-center justify-between"><span className="text-sm font-bold text-airbnb-black">{message.senderId?.name || 'Havenly host'}</span><span className="text-[11px] text-airbnb-gray">{new Date(message.createdAt).toLocaleDateString()}</span></div><p className="mt-2 text-sm text-airbnb-gray">{message.body}</p></div>)}</div>
        </div>
      )}

      {/* Tab 4: My Reviews */}
      {activeTab === 'reviews' && (
        <div className="max-w-3xl space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-airbnb-black">Guest Reviews Contributed</h2>
          <div className="p-5 border border-airbnb-border rounded-2xl bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-airbnb-black">Villa Paradiso - Cliffside Luxury Ocean Villa</h4>
                <p className="text-xs text-airbnb-gray">Udaipur, India · Stayed August 2026</p>
              </div>
              <div className="flex items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-airbnb-black text-airbnb-black" />
                ))}
              </div>
            </div>
            <p className="text-xs text-airbnb-black leading-relaxed">
              "Spectacular cliffside views, immaculate infinity pool, and the host was extraordinarily attentive. One of the best Airbnb experiences!"
            </p>
          </div>

          <div className="p-5 border border-airbnb-border rounded-2xl bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-airbnb-black">Kandolhu Island Overwater Sanctuary</h4>
                <p className="text-xs text-airbnb-gray">Udaipur, India · Stayed July 2026</p>
              </div>
              <div className="flex items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-airbnb-black text-airbnb-black" />
                ))}
              </div>
            </div>
            <p className="text-xs text-airbnb-black leading-relaxed">
              "A beautiful palace stay with thoughtful service and a memorable sunset boat ride on Lake Pichola."
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Preferences & Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white border border-airbnb-border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-airbnb-black">Account Preferences</h2>

          <div className="space-y-4 text-sm divide-y divide-airbnb-borderLight">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-airbnb-black">Preferred Currency</div>
                <div className="text-xs text-airbnb-gray">Prices across all 12+ resorts are converted automatically</div>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 border border-airbnb-border rounded-lg bg-white outline-none cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-airbnb-black">Booking Notifications</div>
                <div className="text-xs text-airbnb-gray">Receive instant email updates for booking confirmations & cancellations</div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-airbnb-black">Account sync</div>
                <div className="text-xs text-airbnb-gray">Your profile and trips stay up to date</div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Connected
              </span>
            </div>

            <div className="pt-4">
              <div className="mb-3"><div className="font-semibold text-airbnb-black">Password & security</div><div className="text-xs text-airbnb-gray">Update your password to keep your account protected.</div></div>
              {passwordMessage && <p className="mb-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">{passwordMessage}</p>}
              {passwordError && <p className="mb-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{passwordError}</p>}
              <form onSubmit={handleChangePassword} className="grid gap-3 sm:grid-cols-2"><input type="password" required minLength="6" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-xl border border-airbnb-border bg-white px-3 py-2.5 text-xs outline-none focus:border-brand" /><input type="password" required minLength="6" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-xl border border-airbnb-border bg-white px-3 py-2.5 text-xs outline-none focus:border-brand" /><button type="submit" className="rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-hover sm:col-span-2">Change password</button></form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile & Photo Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-airbnb-border overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-airbnb-borderLight flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-base text-airbnb-black">Edit Profile & Photo</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-full hover:bg-airbnb-bgSubtle text-airbnb-gray hover:text-airbnb-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {profileSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">Profile updated successfully!</span>
                </div>
              )}

              {profileSaveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{profileSaveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-airbnb-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-airbnb-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                    About / Travel Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell other travelers about your adventures..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full p-3 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                  ></textarea>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Saving your changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
