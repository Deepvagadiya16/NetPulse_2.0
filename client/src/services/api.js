import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('wifi_user');

    if (storedUser) {
      try {
        const { token } = JSON.parse(storedUser);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing stored user in API interceptor:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
