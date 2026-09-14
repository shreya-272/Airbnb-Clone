import React from 'react';

export default function ListingSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Loading listing content">
      {/* Title & Sub-bar Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-slate-200 rounded-lg w-3/4 max-w-xl"></div>
        <div className="flex items-center space-x-3">
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
      </div>

      {/* 5-Photo Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-72 sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100">
        <div className="md:col-span-2 h-full bg-slate-200"></div>
        <div className="hidden md:flex flex-col gap-2 h-full">
          <div className="h-1/2 bg-slate-200 rounded"></div>
          <div className="h-1/2 bg-slate-200 rounded"></div>
        </div>
        <div className="hidden md:flex flex-col gap-2 h-full">
          <div className="h-1/2 bg-slate-200 rounded"></div>
          <div className="h-1/2 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Main Two-Column Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Host header skeleton */}
          <div className="flex items-center justify-between pb-6 border-b border-airbnb-borderLight">
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded w-64"></div>
              <div className="h-4 bg-slate-200 rounded w-48"></div>
            </div>
            <div className="w-14 h-14 bg-slate-200 rounded-full"></div>
          </div>

          {/* Highlights badge skeleton */}
          <div className="h-20 bg-slate-100 rounded-xl border border-slate-200"></div>

          {/* Description paragraph skeleton */}
          <div className="space-y-2.5 pb-6 border-b border-airbnb-borderLight">
            <div className="h-5 bg-slate-200 rounded w-36 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-11/12"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          </div>

          {/* Amenities grid skeleton */}
          <div className="space-y-4">
            <div className="h-5 bg-slate-200 rounded w-44"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Card Skeleton */}
        <div className="lg:col-span-5">
          <div className="border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-7 bg-slate-200 rounded w-28"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
            </div>
            <div className="h-24 bg-slate-100 rounded-xl border border-slate-200"></div>
            <div className="h-12 bg-slate-300 rounded-xl"></div>
            <div className="space-y-3 pt-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
