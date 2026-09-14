import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  Search,
  SlidersHorizontal,
  MapPin,
  Waves,
  Palmtree,
  Mountain,
  Sun,
  Castle,
  Compass,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { fetchAllListings } from '../api/listingApi.js';
import { checkFavoriteStatus, addFavorite, removeFavorite } from '../api/favoriteApi.js';

const CATEGORIES = [
  { id: 'all', label: 'All Resorts', icon: Compass },
  { id: 'Beachfront', label: 'Beachfront', icon: Waves },
  { id: 'Overwater', label: 'Overwater', icon: Waves },
  { id: 'Mountain & Ski', label: 'Mountain & Ski', icon: Mountain },
  { id: 'Desert Escapes', label: 'Desert', icon: Sun },
  { id: 'Tropical', label: 'Tropical', icon: Palmtree },
  { id: 'Lakefront', label: 'Lakefront', icon: Waves },
  { id: 'Historical', label: 'Historical', icon: Castle },
];

export default function ResortCatalog({ onSelectListing }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set of favorited listing IDs
  const [favoriteMap, setFavoriteMap] = useState({});

  const loadResorts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllListings({
        category: selectedCategory,
        search: searchQuery,
      });
      setResorts(data);

      // Check favorite statuses in parallel
      const favs = {};
      await Promise.all(
        data.map(async (r) => {
          try {
            const isFav = await checkFavoriteStatus(r._id);
            if (isFav) favs[r._id] = true;
          } catch {
            // ignore fallback
          }
        })
      );
      setFavoriteMap(favs);
    } catch (err) {
      setError(err.message || 'Failed to load resorts from MongoDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResorts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResorts();
  };

  const handleToggleFavorite = async (e, listingId) => {
    e.stopPropagation();
    const nextStatus = !favoriteMap[listingId];
    setFavoriteMap((prev) => ({ ...prev, [listingId]: nextStatus }));

    try {
      if (nextStatus) {
        await addFavorite(listingId);
      } else {
        await removeFavorite(listingId);
      }
    } catch (err) {
      console.error('Failed to update favorite:', err);
      // Rollback
      setFavoriteMap((prev) => ({ ...prev, [listingId]: !nextStatus }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full sm:max-w-md relative flex items-center shadow-sm hover:shadow-md transition border border-airbnb-border rounded-full overflow-hidden px-4 py-2.5 bg-white"
        >
          <Search className="w-4 h-4 text-airbnb-black mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by city, country or resort name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm font-medium outline-none bg-transparent"
          />
          <button
            type="submit"
            className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-full ml-2 hover:bg-brand-hover transition flex-shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2 text-xs text-airbnb-gray">
          <span className="font-semibold text-airbnb-black">{resorts.length}</span>
          <span>luxury resorts available</span>
        </div>
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none border-b border-airbnb-borderLight">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? 'bg-airbnb-black text-white shadow-sm'
                  : 'bg-airbnb-bgSubtle text-airbnb-gray hover:text-airbnb-black hover:bg-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resorts Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-slate-200 rounded-2xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 px-4 border border-rose-200 bg-rose-50/70 rounded-3xl max-w-lg mx-auto space-y-3">
          <p className="font-semibold text-sm text-rose-900">{error}</p>
          <button
            onClick={loadResorts}
            className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Retry Loading Resorts
          </button>
        </div>
      ) : resorts.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-airbnb-border rounded-3xl bg-airbnb-bgSubtle/40 max-w-md mx-auto space-y-3">
          <Compass className="w-12 h-12 text-airbnb-gray mx-auto stroke-[1.5]" />
          <h3 className="font-bold text-base text-airbnb-black">No resorts match your search</h3>
          <p className="text-xs text-airbnb-gray">Try changing your search terms or picking another category.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="bg-airbnb-black text-white text-xs font-semibold px-4 py-2 rounded-xl mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {resorts.map((resort) => {
            const isFav = Boolean(favoriteMap[resort._id]);
            const coverImage =
              resort.images?.[0] ||
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={resort._id}
                onClick={() => onSelectListing(resort._id)}
                className="group cursor-pointer space-y-3 flex flex-col"
              >
                {/* Photo with Heart Favorite Toggle */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                  <img
                    src={coverImage}
                    alt={resort.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {resort.category || 'Luxury'}
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(e, resort._id)}
                    className="absolute top-3 right-3 p-2 text-white hover:scale-115 transition"
                    title={isFav ? 'Remove from saved' : 'Save to wishlist'}
                  >
                    <Heart
                      className={`w-5 h-5 drop-shadow-md transition ${
                        isFav ? 'fill-brand text-brand' : 'fill-black/30 text-white stroke-2'
                      }`}
                    />
                  </button>
                </div>

                {/* Card Details */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-airbnb-black truncate">
                      {resort.location?.city ? `${resort.location.city}, ` : ''}
                      {resort.location?.country || 'Worldwide'}
                    </span>
                    <span className="flex items-center space-x-1 font-semibold text-airbnb-black flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-airbnb-black" />
                      <span>{resort.rating?.toFixed(2) || '5.0'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-airbnb-gray truncate font-medium">{resort.title}</p>
                  <p className="text-xs text-airbnb-gray">{resort.host?.name ? `Hosted by ${resort.host.name}` : 'Superhost'}</p>

                  <div className="pt-1 text-airbnb-black">
                    <span className="font-extrabold text-sm">${resort.pricePerNight}</span>
                    <span className="text-xs text-airbnb-gray"> night</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
