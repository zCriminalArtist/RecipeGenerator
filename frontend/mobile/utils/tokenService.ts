import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "recipe_app_access_token";
const REFRESH_TOKEN_KEY = "recipe_app_refresh_token";
const TOKEN_EXPIRY_KEY = "recipe_app_token_expiry";

import AsyncStorage from "@react-native-async-storage/async-storage";
const AUTH_STATE_KEY = "recipe_app_auth_state";

export const tokenService = {
  saveAccessToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error("Error saving access token:", error);
      throw error;
    }
  },

  saveRefreshToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving refresh token:", error);
      throw error;
    }
  },

  saveTokens: async (
    accessToken: string,
    refreshToken: string
  ): Promise<void> => {
    try {
      await tokenService.saveAccessToken(accessToken);
      await tokenService.saveRefreshToken(refreshToken);

      await AsyncStorage.setItem(
        AUTH_STATE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          lastAuthenticated: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error saving tokens:", error);
      throw error;
    }
  },

  getAccessToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  isAccessTokenExpired: async (): Promise<boolean> => {
    try {
      const expiryTimeStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
      if (!expiryTimeStr) return true;

      const expiryTime = parseInt(expiryTimeStr, 10);
      return Date.now() > expiryTime;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  },

  clearTokens: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
      await AsyncStorage.removeItem(AUTH_STATE_KEY);
      await AsyncStorage.removeItem("emailVerified");
    } catch (error) {
      console.error("Error clearing tokens:", error);
      throw error;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const accessToken = await tokenService.getAccessToken();
      const isExpired = await tokenService.isAccessTokenExpired();

      if (accessToken && !isExpired) {
        return true;
      }

      if (isExpired) {
        const refreshToken = await tokenService.getRefreshToken();
        return !!refreshToken;
      }

      return false;
    } catch (error) {
      return false;
    }
  },
};

export default tokenService;
