import { Tabs, usePathname, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import WelcomeScreen from "../welcome";
import api from "@/utils/api";
import { Redirect } from "expo-router";
import { isAxiosError } from "axios";

export const AuthContext = React.createContext({
  isAuthenticated: false,
  isSubscribed: false,
  checkAuthStatus: () => {},
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const pathname = usePathname();

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt");

      if (!token) {
        setIsAuthenticated(false);
        setIsSubscribed(false);
        setAuthToken(null);
        setIsLoading(false);
        return;
      }

      setAuthToken(token);
      setIsAuthenticated(true);
      try {
        const response = await api.get("/api/subscription/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Subscription status response:", response.data);

        setIsSubscribed(true);
      } catch (error) {
        console.error("Failed to check subscription status:", error);
        if (isAxiosError(error) && error.response?.status === 401) {
          await AsyncStorage.removeItem("jwt");
          setIsAuthenticated(false);
          setAuthToken(null);
        }
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setIsSubscribed(false);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
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
        }}>
        <Redirect
          href={{
            pathname: "/onboarding",
            params: { token: authToken },
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
