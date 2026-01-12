import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For admin panel, we can add auth token from localStorage if needed
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          if (parsedUser.token) {
            config.headers.Authorization = `Bearer ${parsedUser.token}`;
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;