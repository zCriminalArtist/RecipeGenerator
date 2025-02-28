import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh-token`, { token: refreshToken });
    const { token, newRefreshToken } = response.data;

    await AsyncStorage.setItem('jwt', token);
    await AsyncStorage.setItem('refreshToken', newRefreshToken);

    return token;
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
};

// Add a request interceptor to attach the JWT token to the headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      error.response.data.message === 'Token has expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('refreshToken');
        // Redirect to login screen or show an error message
      }
    }

    return Promise.reject(error);
  }
);

export default api;