import { getStoredToken } from './authApi.js';

const request = async (path, options = {}) => {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getStoredToken()}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Host request failed');
  return data;
};

export const fetchHostDashboard = () => request('host/dashboard');
export const createHostListing = (listing) => request('host/listings', { method: 'POST', body: JSON.stringify(listing) });
