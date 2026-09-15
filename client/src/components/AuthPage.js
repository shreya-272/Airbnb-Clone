import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { forgotPasswordApi } from '../api/authApi.js';

export default function AuthPage({ defaultTab = 'login', onComplete, onBack }) {
  const { login, signup, loginDemo, authError, setAuthError, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState(defaultTab); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setAuthError(null);
    setSuccessMessage('');

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

    if (activeTab === 'signup' && !name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    try {
      if (activeTab === 'signup') {
        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          bio: bio.trim(),
        });
        setSuccessMessage('Account created! Welcome to havenly.');
      } else {
        await login({
          email: email.trim(),
          password,
        });
        setSuccessMessage('Logged in successfully!');
      }

      if (onComplete) {
        setTimeout(onComplete, 600);
      }
    } catch {
      // Error handled by AuthContext
    }
  };

  const handleDemoClick = async () => {
    setValidationError('');
    setAuthError(null);
    try {
      await loginDemo();
      setSuccessMessage('Logged in as Demo Traveler (Eleanor Vance)!');
      if (onComplete) {
        setTimeout(onComplete, 600);
      }
    } catch {
      // Handled in context
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setValidationError('');
    setAuthError(null);
    try {
      await forgotPasswordApi(email.trim());
      setSuccessMessage('If an account exists, password recovery instructions are ready.');
    } catch (error) {
      setValidationError(error.message);
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="auth-screen min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Back navigation */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center space-x-1.5 text-xs font-bold text-airbnb-gray hover:text-airbnb-black transition cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to resort catalog</span>
          </button>
        )}

        {/* Card Container */}
        <div className="auth-card bg-white rounded-3xl shadow-card border border-airbnb-border p-8 space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 text-brand mb-2">
              <svg className="h-7 w-7 fill-current" viewBox="0 0 32 32">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.328l.011.389c0 4.002-3.136 7.2-7.1 7.2-2.146 0-4.095-.944-5.4-2.483-1.305 1.539-3.254 2.483-5.4 2.483-3.964 0-7.1-3.198-7.1-7.2 0-1.127.311-2.316.971-3.717l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.328 0-2.348.647-3.414 2.545l-.547 1.054c-1.94 3.8-6.096 12.5-7.067 14.763l-.135.332c-.596 1.264-.837 2.227-.837 3.106 0 2.871 2.228 5.2 5.1 5.2 1.776 0 3.447-.94 4.382-2.463l.518-.847.518.847c.935 1.523 2.606 2.463 4.382 2.463 2.872 0 5.1-2.329 5.1-5.2 0-.879-.241-1.842-.837-3.106l-.135-.332c-.971-2.263-5.127-10.963-7.067-14.763l-.547-1.054C18.348 3.647 17.328 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.905-1.332 3.498-3.103 3.899l-.297.049-.6.052c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .977.701 1.79 1.636 1.967l.178.024.186.009c1.105 0 2-.895 2-2 0-1.105-.895-2-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-airbnb-black tracking-tight">
              {isForgotPassword ? 'Reset your password' : activeTab === 'login' ? 'Log in to your account' : 'Create an account'}
            </h1>
            <p className="text-xs text-airbnb-gray">
              Keep your favorite stays close, manage bookings, and share the places you love.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-airbnb-bgSubtle p-1 rounded-xl border border-airbnb-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setValidationError('');
                setAuthError(null);
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setValidationError('');
                setAuthError(null);
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-lg transition cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-airbnb-black shadow-sm font-bold'
                  : 'text-airbnb-gray hover:text-airbnb-black'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {displayError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{displayError}</span>
            </div>
          )}

          {/* Form */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm leading-6 text-airbnb-gray">Enter your email and we’ll prepare a secure password reset link.</p>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-airbnb-gray" /><input type="email" required placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-airbnb-border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black" /></div>
              <button type="submit" className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-hover">Send reset link</button>
              <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-xs font-bold text-airbnb-gray underline hover:text-airbnb-black">Back to login</button>
            </form>
          ) : <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <>
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
              </>
            )}

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

            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase text-airbnb-black mb-1">
                  Bio <span className="text-airbnb-gray lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Travel enthusiast exploring luxury stays"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-airbnb-border rounded-xl focus:border-airbnb-black focus:ring-1 focus:ring-airbnb-black outline-none transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-brand via-[#E31C5F] to-brand-dark hover:brightness-105 text-white font-semibold py-3.5 rounded-xl text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Preparing your account...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Log in' : 'Create account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-airbnb-border w-full"></div>
            <span className="auth-divider bg-white px-3 text-xs text-airbnb-gray uppercase tracking-wider font-semibold">
              or
            </span>
          </div>

          {!isForgotPassword && activeTab === 'login' && <button type="button" onClick={() => setIsForgotPassword(true)} className="-mt-3 w-full text-right text-xs font-semibold text-brand hover:underline">Forgot password?</button>}

          {/* Quick Demo Traveler Button */}
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={isLoading}
            className="auth-demo-button w-full flex items-center justify-center space-x-2.5 p-3 rounded-xl border border-slate-300 hover:border-slate-800 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Continue as Eleanor Vance (Demo Traveler)</span>
          </button>

          {/* Security footnote */}
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your information is protected and private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
