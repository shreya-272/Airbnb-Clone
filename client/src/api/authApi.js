const API_BASE_URL = '/api/auth';
const TOKEN_KEY = 'airbnb_auth_token';
const USER_KEY = 'airbnb_auth_user';

/**
 * Storage helpers
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredAuth = (token, user) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to persist auth in localStorage:', err);
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth from localStorage:', err);
  }
};

/**
 * Register a new user in MongoDB
 */
export const signupUser = async ({ name, email, password, bio, avatar }) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, bio, avatar }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  setStoredAuth(data.token, data.user);
  return data;
};

/**
 * Log in an existing user with email and password
 */
export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  setStoredAuth(data.token, data.user);
  return data;
};

/**
 * Quick 1-click Demo traveler login
 */
export const loginDemoUser = async () => {
  const response = await fetch(`${API_BASE_URL}/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Demo login failed');
  }

  setStoredAuth(data.token, data.user);
  return data;
};

/**
 * Fetch currently logged in user using JWT token
 */
export const fetchCurrentUser = async (token) => {
  const authToken = token || getStoredToken();
  if (!authToken) return null;

  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    clearStoredAuth();
    return null;
  }

  const data = await response.json();
  if (data.user) {
    setStoredAuth(authToken, data.user);
    return data.user;
  }
  return null;
};
