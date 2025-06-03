import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { router } from "expo-router";
import tokenService from "./tokenService";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Define public endpoints that don't require authentication
const publicEndpoints = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/refresh-token",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.config.headers = request.config.headers || {};
      request.config.headers.Authorization = `Bearer ${token}`;
      request.resolve(api(request.config));
    }
  });

  failedQueue = [];
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh-token`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    await tokenService.saveTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    await tokenService.clearTokens();
    throw error;
  }
};

// Check if an endpoint is public (doesn't require authentication)
const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;

  return publicEndpoints.some((endpoint) => {
    // Check if the URL contains the endpoint
    // This handles both exact matches and paths with parameters
    return url.includes(endpoint);
  });
};

api.interceptors.request.use(
  async (config) => {
    // Skip token check for public endpoints
    if (config.url && isPublicEndpoint(config.url)) {
      return config;
    }

    const isExpired = await tokenService.isAccessTokenExpired();

    if (isExpired) {
      const isRefreshRequest = config.url?.includes("/refresh-token");

      if (!isRefreshRequest) {
        try {
          const newToken = await refreshAccessToken();
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          console.error("Error in request interceptor:", error);
          await tokenService.clearTokens();
          router.replace("/account?form=login");
          return Promise.reject(error);
        }
      }
    } else {
      const accessToken = await tokenService.getAccessToken();
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for public endpoints
    if (originalRequest.url && isPublicEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);

        router.replace("/account?form=login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
