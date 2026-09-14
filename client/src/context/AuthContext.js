import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signupUser,
  loginUser,
  loginDemoUser,
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  clearStoredAuth,
} from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Modal control states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'

  // Validate stored token against MongoDB on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const remoteUser = await fetchCurrentUser(storedToken);
          if (remoteUser) {
            setUser(remoteUser);
            setToken(storedToken);
          } else {
            setUser(null);
            setToken(null);
          }
        } catch {
          // If network failure, fall back to stored user
          setUser(getStoredUser());
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const signup = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signupUser(userData);
      setUser(result.user);
      setToken(result.token);
      closeAuthModal();
      return result;
    } catch (err) {
      setAuthError(err.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await loginUser(credentials);
      setUser(result.user);
      setToken(result.token);
      closeAuthModal();
      return result;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await loginDemoUser();
      setUser(result.user);
      setToken(result.token);
      closeAuthModal();
      return result;
    } catch (err) {
      setAuthError(err.message || 'Demo login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    authError,
    setAuthError,
    signup,
    login,
    loginDemo,
    logout,
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
