import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Lato_400Regular: require("@/assets/fonts/Lato-Regular.ttf"),
    Playfair: require("@/assets/fonts/PlayfairDisplay-Bold.ttf"),
    Montserrat_700Bold: require("@/assets/fonts/Montserrat-Bold.ttf"),
    Montserrat_600SemiBold: require("@/assets/fonts/Montserrat-SemiBold.ttf"),
    Montserrat_500Medium: require("@/assets/fonts/Montserrat-Medium.ttf"),
    Montserrat_400Regular: require("@/assets/fonts/Montserrat-Regular.ttf"),
    OpenSans: require("@/assets/fonts/OpenSans-Regular.ttf"),
    BebasNeue_Regular: require("@/assets/fonts/BebasNeue-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="forgot" options={{ headerShown: false }} />
        <Stack.Screen name="trial" options={{ headerShown: false }} />
        <Stack.Screen
          name="subscription-settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
