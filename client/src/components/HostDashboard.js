import React, { useEffect, useState } from 'react';
import { BarChart3, CalendarDays, Home, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { fetchHostDashboard } from '../api/hostApi.js';

export default function HostDashboard({ onExplore }) {
  const [data, setData] = useState({ listings: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchHostDashboard();
      setData(response.data || { listings: [], bookings: [] });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load host dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const confirmedBookings = data.bookings.filter((booking) => ['confirmed', 'pending'].includes(booking.status));
  const revenue = confirmedBookings.reduce((total, booking) => total + (booking.totalPriceINR || booking.totalPrice * 83 || 0), 0);

  return (
    <main className="page-wash min-h-[calc(100vh-80px)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-3xl bg-[#24332f] p-6 text-white shadow-floating sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f8c8ae]">Host studio</p><h1 className="mt-2 font-display text-4xl">Your stays, beautifully managed.</h1><p className="mt-2 max-w-xl text-sm text-white/70">Track reservations, watch your performance, and keep every guest experience moving.</p></div>
            <button onClick={onExplore} className="rounded-full bg-brand px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-hover">Preview guest view</button>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
        {loading ? <div className="grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /></div> : <>
          <div className="grid gap-4 md:grid-cols-3">
            {[['Active listings', data.listings.length, Home], ['Upcoming reservations', confirmedBookings.length, CalendarDays], ['Booked revenue', `₹${revenue.toLocaleString('en-IN')}`, TrendingUp]].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-airbnb-border bg-white p-5 shadow-card"><Icon className="h-5 w-5 text-brand" /><p className="mt-5 text-xs text-airbnb-gray">{label}</p><p className="mt-1 text-2xl font-bold text-airbnb-black">{value}</p></div>)}
          </div>
          <section className="rounded-3xl border border-airbnb-border bg-white p-5 shadow-card sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold text-airbnb-black">Your listings</h2><p className="mt-1 text-xs text-airbnb-gray">Manage the stays connected to this host account.</p></div><button onClick={loadDashboard} className="rounded-full border border-airbnb-border p-2 text-airbnb-gray hover:bg-airbnb-bgSubtle" title="Refresh host dashboard"><RefreshCw className="h-4 w-4" /></button></div>{data.listings.length === 0 ? <div className="rounded-2xl border border-dashed border-airbnb-border p-10 text-center"><BarChart3 className="mx-auto h-8 w-8 text-airbnb-gray" /><p className="mt-3 text-sm font-bold text-airbnb-black">No host listings yet</p><p className="mt-1 text-xs text-airbnb-gray">Create your first stay from the host tools.</p><button className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" />Add listing</button></div> : <div className="grid gap-4 md:grid-cols-2">{data.listings.map((listing) => <article key={listing._id} className="flex gap-4 rounded-2xl border border-airbnb-border p-3"><img src={listing.images?.[0]} alt={listing.title} className="h-24 w-28 rounded-xl object-cover" /><div className="min-w-0"><h3 className="truncate text-sm font-bold text-airbnb-black">{listing.title}</h3><p className="mt-1 text-xs text-airbnb-gray">{listing.location?.city}, India</p><p className="mt-3 text-xs font-bold text-airbnb-black">₹{(listing.pricePerNightINR || listing.pricePerNight * 83).toLocaleString('en-IN')} <span className="font-normal text-airbnb-gray">/ night</span></p></div></article>)}</div>}</section>
        </>}
      </div>
    </main>
  );
}
