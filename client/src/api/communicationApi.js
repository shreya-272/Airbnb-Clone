import { getStoredToken } from './authApi.js';
import { API_BASE_URL } from './apiConfig.js';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getStoredToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const fetchMessages = () => request('messages');
export const fetchNotifications = () => request('notifications');
export const markNotificationsRead = () => request('notifications/read', { method: 'POST' });
