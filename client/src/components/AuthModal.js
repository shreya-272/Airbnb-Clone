import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    signup,
    loginDemo,
    authError,
    setAuthError,
    isLoading
  } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setAuthError(null);

    // Client-side validations
    if (!email.trim() || !password) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (authModalTab === 'signup' && !name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    try {
      if (authModalTab === 'signup') {
        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          bio: bio.trim(),
        });
      } else {
        await login({
          email: email.trim(),
          password,
        });
      }
    } catch {
      // Error is caught and stored in authError by context
    }
  };

  const handleDemoClick = async () => {
    setValidationError('');
    setAuthError(null);
    try {
      await loginDemo();
    } catch {
      // Handled in context
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-airbnb-border overflow-hidden flex flex-col relative max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-airbnb-borderLight flex items-center justify-between">
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-airbnb-bgSubtle text-airbnb-gray hover:text-airbnb-black transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-airbnb-black">
            {authModalTab === 'login' ? 'Log in' : 'Sign up'}
          </span>
          <div className="w-8"></div> {/* Balancer spacer */}
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Welcome Header */}
          <div>
            <h3 className="text-xl font-bold text-airbnb-black tracking-tight">
              Welcome to Airbnb
            </h3>
            <p className="text-xs text-airbnb-gray mt-1">
              Explore 12 world-class luxury resorts, manage your trips, and save wishlists.
            </p>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex bg-airbnb-bgSubtle p-1 rounded-xl border border-airbnb-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setValidationError('');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('signup');
                setValidationError('');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authModalTab === 'signup'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Error Alert Box */}
          {displayError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{displayError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field for Sign Up */}
            {authModalTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-airbnb-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sophia Laurent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-airbnb-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-airbnb-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-airbnb-gray hover:text-airbnb-black transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional Bio for Sign Up */}
            {authModalTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                  Traveler Bio <span className="text-airbnb-gray lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Architect exploring coastal villas"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-brand via-[#E31C5F] to-brand-dark hover:brightness-105 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Connecting to MongoDB...</span>
                </>
              ) : (
                <>
                  <span>{authModalTab === 'login' ? 'Log in' : 'Create account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-airbnb-border w-full"></div>
            <span className="bg-white px-3 text-xs text-airbnb-gray uppercase tracking-wider font-semibold">
              or
            </span>
          </div>

          {/* Quick 1-Click Demo Traveler Login */}
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2.5 p-3 rounded-xl border border-slate-300 hover:border-slate-800 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition active:scale-[0.99] cursor-pointer shadow-xs"
            title="Instant login with pre-configured traveler profile"
          >
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Continue as Eleanor Vance (Demo Traveler)</span>
          </button>

          {/* Terms info */}
          <p className="text-[11px] text-airbnb-gray text-center leading-relaxed pt-2">
            By continuing, you agree to Airbnb's Terms of Service and confirm you have read our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
