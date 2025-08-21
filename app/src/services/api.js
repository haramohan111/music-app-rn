// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
console.log('API Error:', error);
    // If 401 and not retrying already, and not hitting refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry && !originalRequest.url.includes('/web-refresh-token')

    ) {
      originalRequest._retry = true;

      try {
        const { store } = await import('../redux/store');
        const { refreshToken } = await import('../redux/features/auth/authSlice');

        // Try refresh
        await store.dispatch(refreshToken()).unwrap();

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        const { store } = await import('../redux/store');
        const { logoutUser } = await import('../redux/features/auth/authSlice');
        console.log('Refresh failed, logging out:', refreshError);
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
