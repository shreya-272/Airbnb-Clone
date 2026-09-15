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
  Sparkles,
  MapPinned,
  List,
  X,
  GitCompare,
  Clock,
  ChevronRight
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
  const [viewMode, setViewMode] = useState('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(125000);
  const [minRating, setMinRating] = useState(0);
  const [minGuests, setMinGuests] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

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
      setRecentlyViewed((current) => {
        const refreshed = current.map((saved) => data.find((item) => item._id === saved._id) || saved);
        localStorage.setItem('havenly_recently_viewed', JSON.stringify(refreshed));
        return refreshed;
      });

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
      setError(err.message || 'Failed to load stays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResorts();
  }, [selectedCategory]);

  useEffect(() => {
    try {
      setRecentlyViewed(JSON.parse(localStorage.getItem('havenly_recently_viewed') || '[]'));
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

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

  const rememberListing = (resort) => {
    const next = [resort, ...recentlyViewed.filter((item) => item._id !== resort._id)].slice(0, 4);
    setRecentlyViewed(next);
    localStorage.setItem('havenly_recently_viewed', JSON.stringify(next));
    onSelectListing(resort._id);
  };

  const toggleCompare = (e, resort) => {
    e.stopPropagation();
    setCompareItems((current) => current.some((item) => item._id === resort._id)
      ? current.filter((item) => item._id !== resort._id)
      : current.length < 3 ? [...current, resort] : current);
  };

  const visibleResorts = [...resorts]
    .filter((resort) => (resort.pricePerNightINR || resort.pricePerNight * 83 || 0) <= maxPrice)
    .filter((resort) => (resort.rating || 0) >= minRating)
    .filter((resort) => (resort.guestCapacity || 0) >= minGuests)
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.pricePerNight || 0) - (b.pricePerNight || 0);
      if (sortBy === 'price-high') return (b.pricePerNight || 0) - (a.pricePerNight || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.rating || 0) - (a.rating || 0);
    });

  return (
    <div className="page-wash min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#24332f] px-6 py-10 sm:px-12 sm:py-14 text-white shadow-floating">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(25,42,38,.98),rgba(25,42,38,.66),rgba(25,42,38,.15)),url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="relative max-w-2xl space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f8c8ae]">A considered collection of stays</p>
          <h1 className="font-display text-4xl leading-tight sm:text-6xl">Go somewhere that stays with you.</h1>
          <p className="max-w-lg text-sm leading-6 text-white/75 sm:text-base">Handpicked homes, quiet retreats, and unforgettable places made for your next chapter.</p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 -mt-2">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full sm:max-w-xl relative flex items-center shadow-card hover:shadow-floating transition border border-airbnb-border rounded-full overflow-hidden px-5 py-3 bg-white"
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
            className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full ml-2 hover:bg-brand-hover transition flex-shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2 text-xs text-airbnb-gray">
          <span className="font-semibold text-airbnb-black">{visibleResorts.length}</span>
          <span>luxury resorts available</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setFiltersOpen((open) => !open)}
          className={`inline-flex items-center space-x-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${filtersOpen ? 'border-brand bg-brand/10 text-brand' : 'border-airbnb-border bg-white text-airbnb-black hover:bg-airbnb-bgSubtle'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(minRating > 0 || minGuests > 0 || maxPrice < 125000) && <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] text-white">On</span>}
        </button>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-airbnb-border bg-white px-4 py-2.5 text-xs font-semibold text-airbnb-black outline-none">
            <option value="recommended">Sort: Recommended</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
          <div className="flex rounded-full border border-airbnb-border bg-white p-1">
            <button onClick={() => setViewMode('list')} className={`rounded-full p-2 ${viewMode === 'list' ? 'bg-[#24332f] text-white' : 'text-airbnb-gray'}`} title="List view"><List className="h-4 w-4" /></button>
            <button onClick={() => setViewMode('map')} className={`rounded-full p-2 ${viewMode === 'map' ? 'bg-[#24332f] text-white' : 'text-airbnb-gray'}`} title="Map view"><MapPinned className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="grid grid-cols-1 gap-5 rounded-3xl border border-airbnb-border bg-white p-5 shadow-card sm:grid-cols-3 animate-fade-in">
          <label className="space-y-2 text-xs font-bold text-airbnb-black">
            <span className="flex justify-between"><span>Price per night</span><span className="text-brand">Up to ₹{maxPrice.toLocaleString('en-IN')}</span></span>
            <input type="range" min="15000" max="125000" step="5000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-brand" />
          </label>
          <label className="space-y-2 text-xs font-bold text-airbnb-black">
            <span>Minimum rating</span>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full rounded-xl border border-airbnb-border bg-white px-3 py-2 font-normal outline-none"><option value="0">Any rating</option><option value="4.5">4.5 and above</option><option value="4.8">4.8 and above</option></select>
          </label>
          <label className="space-y-2 text-xs font-bold text-airbnb-black">
            <span>Guests</span>
            <select value={minGuests} onChange={(e) => setMinGuests(Number(e.target.value))} className="w-full rounded-xl border border-airbnb-border bg-white px-3 py-2 font-normal outline-none"><option value="0">Any capacity</option><option value="2">2+ guests</option><option value="4">4+ guests</option><option value="6">6+ guests</option></select>
          </label>
        </div>
      )}

      {/* Category Pills Carousel */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-3 scrollbar-none border-b border-airbnb-borderLight">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                isSelected
                  ? 'bg-[#24332f] text-white shadow-sm'
                  : 'bg-white text-airbnb-gray hover:text-airbnb-black hover:bg-[#f4e9e2]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resorts Cards Grid */}
      {recentlyViewed.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <section className="space-y-4">
          <div className="flex items-end justify-between"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand"><Clock className="h-3.5 w-3.5" /> Continue exploring</p><h2 className="mt-1 text-xl font-bold text-airbnb-black">Recently viewed stays</h2></div></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentlyViewed.map((resort) => <button key={resort._id} onClick={() => rememberListing(resort)} className="group text-left"><div className="aspect-[4/3] overflow-hidden rounded-2xl"><img src={resort.images?.[0] || '/images/resorts/hotel-001.jpg'} alt={resort.title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/resorts/hotel-001.jpg'; }} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><p className="mt-2 truncate text-xs font-bold text-airbnb-black">{resort.title}</p><p className="text-[11px] text-airbnb-gray">{resort.location?.city}, India</p></button>)}
          </div>
        </section>
      )}

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
      ) : visibleResorts.length === 0 ? (
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
        viewMode === 'map' ? (
          <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-airbnb-border bg-[#d8e3dd] shadow-card">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(30deg, transparent 48%, rgba(255,255,255,.8) 49%, transparent 51%), linear-gradient(120deg, transparent 48%, rgba(255,255,255,.8) 49%, transparent 51%)', backgroundSize: '120px 120px' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0,rgba(212,226,218,.4)_65%,rgba(193,211,201,.7)_100%)]" />
            {visibleResorts.map((resort, index) => <button key={resort._id} onClick={() => rememberListing(resort)} className="absolute z-10 rounded-full bg-[#24332f] px-3 py-2 text-xs font-bold text-white shadow-floating transition hover:scale-110" style={{ left: `${18 + ((index * 23) % 68)}%`, top: `${18 + ((index * 31) % 62)}%` }}>₹{(resort.pricePerNightINR || resort.pricePerNight * 83).toLocaleString('en-IN')}<span className="ml-1 text-[10px] font-normal">/ night</span></button>)}
            <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-4 py-3 text-xs font-semibold text-[#24332f] shadow-card backdrop-blur-sm"><MapPinned className="mr-2 inline h-4 w-4 text-brand" />Explore stays by location</div>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {visibleResorts.map((resort) => {
            const isFav = Boolean(favoriteMap[resort._id]);
            const coverImage =
              resort.images?.[0] ||
              '/images/resorts/hotel-001.jpg';

            return (
              <div
                key={resort._id}
                onClick={() => rememberListing(resort)}
                className="group cursor-pointer space-y-3 flex flex-col animate-fade-in"
              >
                {/* Photo with Heart Favorite Toggle */}
                <div className="relative aspect-[4/4.3] rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                  <img
                    src={coverImage}
                    alt={resort.title}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/images/resorts/hotel-001.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />

                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {resort.category || 'Luxury'}
                  </div>

                  {resort.rating >= 4.8 && (
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#24332f] shadow-sm backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 text-brand" />
                      <span>Guest favorite</span>
                    </div>
                  )}

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
                  <button onClick={(e) => toggleCompare(e, resort)} className={`absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold shadow-sm backdrop-blur-sm transition ${compareItems.some((item) => item._id === resort._id) ? 'bg-brand text-white' : 'bg-white/90 text-[#24332f] hover:bg-white'}`} title="Compare this stay"><GitCompare className="h-3 w-3" />{compareItems.some((item) => item._id === resort._id) ? 'Added' : 'Compare'}</button>
                </div>

                {/* Card Details */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-airbnb-black truncate">
                      {resort.location?.city ? `${resort.location.city}, ` : ''}
                      India
                    </span>
                    <span className="flex items-center space-x-1 font-semibold text-airbnb-black flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-airbnb-black" />
                      <span>{resort.rating?.toFixed(2) || '5.0'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-airbnb-gray truncate font-medium">{resort.title}</p>
                  <p className="text-xs text-airbnb-gray">{resort.host?.name ? `Hosted by ${resort.host.name}` : 'Superhost'}</p>

                  <div className="pt-1 text-airbnb-black">
                    <span className="font-extrabold text-sm">₹{(resort.pricePerNightINR || resort.pricePerNight * 83).toLocaleString('en-IN')}</span>
                    <span className="text-xs text-airbnb-gray"> night</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      <section className="grid gap-5 border-t border-airbnb-borderLight pt-10 md:grid-cols-3">
        {[['Weekend escapes', 'Slow mornings and beautiful views close to home', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80'], ['Made for the wild', 'Cabins, peaks, and fresh-air adventures', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=700&q=80'], ['Sun-soaked stays', 'Trade your routine for a little more blue sky', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80']].map(([title, text, image]) => <article key={title} className="group relative min-h-52 overflow-hidden rounded-3xl"><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><div className="relative flex h-full min-h-52 flex-col justify-end p-5 text-white"><h3 className="font-display text-2xl">{title}</h3><p className="mt-1 max-w-xs text-xs text-white/75">{text}</p><ChevronRight className="mt-3 h-4 w-4 text-[#f8c8ae]" /></div></article>)}
      </section>

      {compareItems.length > 0 && <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#24332f] px-4 py-3 text-white shadow-floating animate-slide-up"><div className="flex items-center gap-2 text-xs font-semibold"><GitCompare className="h-4 w-4 text-[#f8c8ae]" />{compareItems.length} stay{compareItems.length > 1 ? 's' : ''} selected</div><div className="flex items-center gap-2"><button onClick={() => setCompareItems([])} className="rounded-full px-3 py-2 text-xs text-white/70 hover:bg-white/10">Clear</button><button onClick={() => setIsCompareOpen(true)} disabled={compareItems.length < 2} className="rounded-full bg-brand px-4 py-2 text-xs font-bold disabled:opacity-40">Compare now</button></div></div>}

      {isCompareOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-floating"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Side by side</p><h2 className="mt-1 text-2xl font-bold text-airbnb-black">Compare your stays</h2></div><button onClick={() => setIsCompareOpen(false)} className="rounded-full p-2 text-airbnb-gray hover:bg-airbnb-bgSubtle"><X className="h-5 w-5" /></button></div><div className="grid gap-4 sm:grid-cols-3">{compareItems.map((item) => <div key={item._id} className="space-y-3 rounded-2xl border border-airbnb-border p-3"><img src={item.images?.[0]} alt={item.title} className="aspect-[4/3] w-full rounded-xl object-cover" /><h3 className="text-sm font-bold text-airbnb-black">{item.title}</h3><p className="text-xs text-airbnb-gray">{item.location?.city}, India</p><div className="flex justify-between text-xs"><span className="font-bold text-airbnb-black">₹{(item.pricePerNightINR || item.pricePerNight * 83).toLocaleString('en-IN')}/night</span><span className="flex items-center gap-1 text-airbnb-black"><Star className="h-3 w-3 fill-current" />{item.rating || 'New'}</span></div><p className="text-xs text-airbnb-gray">Up to {item.guestCapacity || 2} guests · {item.bedrooms || 1} bedrooms</p></div>)}</div></div></div>}
      </div>
    </div>
  );
}
