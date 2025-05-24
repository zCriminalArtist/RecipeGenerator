import { useEffect, useState } from "react";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

export default function DeepLinkHandler() {
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log("Deep link received:", url);
      router.replace("/account?form=login");

      if (url.includes("/verify-email") || url.includes("verify-email")) {
        try {
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get("token");
          if (!token) return;
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-email?token=${token}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            await AsyncStorage.setItem("jwt", data.token);
            await AsyncStorage.setItem("emailVerified", "true");

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Email Verified",
                body: "Your email has been successfully verified!",
              },
              trigger: null,
            });
          } else {
            console.error("Email verification failed");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } catch (error) {
          console.error("Error handling email verification link:", error);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isNavigationReady]);

  return null;
}
