import { Tabs, usePathname, router } from "expo-router";
import React, { useEffect, useState, createContext } from "react";
import { Platform, ActivityIndicator, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import WelcomeScreen from "../welcome";
import api from "@/utils/api";
import { Redirect } from "expo-router";
import { isAxiosError } from "axios";
import tokenService from "@/utils/tokenService";

export const AuthContext = React.createContext({
  isAuthenticated: false,
  isSubscribed: false,
  checkAuthStatus: () => {},
  logout: () => {},
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const isAuth = await tokenService.isAuthenticated();

      if (isAuth) {
        try {
          const response = await api.get("/api/auth/me");
          setIsAuthenticated(true);
          setIsSubscribed(response.data.subscribed || false);
        } catch (error) {
          console.log("Auth verification failed:", error);
          setIsAuthenticated(false);
          setIsSubscribed(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (refreshToken) {
        try {
          await api.post("/api/auth/logout", { refreshToken });
        } catch (error) {
          console.log("Logout API error (expected if token expired):", error);
        }
      }
    } finally {
      await tokenService.clearTokens();
      setIsAuthenticated(false);
      setIsSubscribed(false);
      router.replace("/account?form=login");
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}>
        <ActivityIndicator size="large" color="#0CD384" />
      </View>
    );
  }

  if (isAuthenticated && !isSubscribed) {
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated: true,
          isSubscribed: false,
          checkAuthStatus,
          logout,
        }}>
        <Redirect
          href={{
            pathname: "/onboarding",
          }}
        />
      </AuthContext.Provider>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated: false,
          isSubscribed: false,
          checkAuthStatus,
          logout,
        }}>
        <WelcomeScreen />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: true,
        isSubscribed: true,
        checkAuthStatus,
        logout,
      }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0CD384",
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            backgroundColor: theme.input.backgroundColor,
            ...(Platform.OS === "ios" ? { position: "absolute" } : {}),
            borderTopWidth: 0,
            height: 80,
          },
          animation: "fade",
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recipes"
          options={{
            title: "Recipes",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="book" color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthContext.Provider>
  );
}
