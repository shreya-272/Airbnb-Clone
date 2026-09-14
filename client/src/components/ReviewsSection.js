import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, User, Sparkles } from 'lucide-react';
import { fetchListingReviews, submitReview } from '../api/reviewApi.js';

export default function ReviewsSection({ listingId, onReviewAdded }) {
  const [reviews, setReviews] = useState([]);
  const [categoryAverages, setCategoryAverages] = useState({
    cleanliness: 5.0,
    accuracy: 5.0,
    checkIn: 5.0,
    communication: 5.0,
    location: 5.0,
    value: 4.9,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadReviews = async () => {
    if (!listingId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchListingReviews(listingId);
      if (res.success) {
        setReviews(res.data || []);
        if (res.categoryAverages) {
          setCategoryAverages(res.categoryAverages);
        }
      }
    } catch (err) {
      setError('Could not load reviews from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [listingId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFormError('Please write a review comment');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await submitReview(listingId, {
        author: {
          name: authorName.trim() || 'Guest Traveler',
          location: 'Verified Guest',
        },
        rating: Number(rating),
        comment: comment.trim(),
      });

      if (res.success) {
        setSubmitSuccess(true);
        setComment('');
        setAuthorName('');
        setRating(5);
        // Refresh reviews list
        await loadReviews();
        // Notify parent to refresh listing's updated rating & review count
        if (onReviewAdded) {
          onReviewAdded(res.updatedListing);
        }
        setTimeout(() => {
          setSubmitSuccess(false);
          setIsFormOpen(false);
        }, 2000);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 border-t border-airbnb-borderLight mt-12" id="reviews-section">
      {/* Reviews Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-2xl font-bold text-airbnb-black">
            <Star className="w-6 h-6 fill-airbnb-black text-airbnb-black mr-2" />
            <span>5.0</span>
          </div>
          <span className="text-xl text-airbnb-gray">·</span>
          <span className="text-2xl font-bold text-airbnb-black">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center space-x-2 border border-airbnb-black text-airbnb-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-airbnb-bgSubtle transition active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isFormOpen ? 'Close review form' : 'Write a review'}</span>
        </button>
      </div>

      {/* Review Submission Form Drawer / Card */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-10 p-6 border border-airbnb-border rounded-2xl bg-airbnb-bgSubtle/60 shadow-sm space-y-4 max-w-2xl transition"
        >
          <div className="font-semibold text-base text-airbnb-black flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Leave a review for Villa Paradiso</span>
          </div>

          {submitSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Review submitted successfully! Listing ratings updated.</span>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-airbnb-black mb-1">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Maya Lin"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-airbnb-border bg-white outline-none focus:border-airbnb-black transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-airbnb-black mb-1">Rating</label>
              <div className="flex items-center space-x-1 py-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="p-1 text-airbnb-black hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        num <= rating ? 'fill-brand text-brand' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-airbnb-gray ml-2">{rating} / 5 stars</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-airbnb-black mb-1">Your Review</label>
            <textarea
              rows="3"
              placeholder="What did you love about your stay? Mention views, cleanliness, and the host..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm p-3 rounded-lg border border-airbnb-border bg-white outline-none focus:border-airbnb-black transition resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-airbnb-gray hover:text-airbnb-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-brand hover:bg-brand-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 6-Category Rating Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 mb-10 text-sm">
        {/* Cleanliness */}
        <div className="flex items-center justify-between">
          <span>Cleanliness</span>
          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-airbnb-black h-full rounded-full"
                style={{ width: `${(categoryAverages.cleanliness / 5) * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-xs w-6 text-right">
              {categoryAverages.cleanliness?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center justify-between">
          <span>Accuracy</span>
          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-airbnb-black h-full rounded-full"
                style={{ width: `${(categoryAverages.accuracy / 5) * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-xs w-6 text-right">
              {categoryAverages.accuracy?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Communication */}
        <div className="flex items-center justify-between">
          <span>Communication</span>
          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-airbnb-black h-full rounded-full"
                style={{ width: `${(categoryAverages.communication / 5) * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-xs w-6 text-right">
              {categoryAverages.communication?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between">
          <span>Location</span>
          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-airbnb-black h-full rounded-full"
                style={{ width: `${(categoryAverages.location / 5) * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-xs w-6 text-right">
              {categoryAverages.location?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Check-in */}
        <div className="flex items-center justify-between">
          <span>Check-in</span>
          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-airbnb-black h-full rounded-full"
                style={{ width: `${(categoryAverages.checkIn / 5) * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-xs w-6 text-right">
              {categoryAverages.checkIn?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Value */}
        <div className="flex items-center justify-between">
          <span>Value</span>
          <div className="flex items-center space-x-3 w-40">
            <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-airbnb-black h-full rounded-full"
                style={{ width: `${(categoryAverages.value / 5) * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-xs w-6 text-right">
              {categoryAverages.value?.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Review Cards Grid (2-column layout) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-28"></div>
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-airbnb-gray text-sm">
          No reviews yet. Be the first to leave a review!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {reviews.map((rev) => {
            const reviewDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              : 'Recent stay';

            return (
              <div key={rev._id} className="space-y-3 text-sm">
                {/* Reviewer Header */}
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      rev.author?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                    }
                    alt={rev.author?.name || 'Guest'}
                    className="w-12 h-12 rounded-full object-cover border border-airbnb-borderLight shadow-sm"
                  />
                  <div>
                    <div className="font-semibold text-airbnb-black">{rev.author?.name}</div>
                    <div className="text-xs text-airbnb-gray">
                      {rev.author?.location || 'Verified Guest'} · {reviewDate}
                    </div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center space-x-0.5 text-airbnb-black">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                {/* Review Comment */}
                <p className="text-airbnb-black leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Show All Reviews Footer CTA */}
      {reviews.length > 0 && (
        <div className="mt-10">
          <button className="border border-airbnb-black font-semibold text-sm px-6 py-3 rounded-lg hover:bg-airbnb-bgSubtle transition">
            Show all {reviews.length} reviews
          </button>
        </div>
      )}
    </section>
  );
}
