import { useLocalSearchParams, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { darkTheme, lightTheme } from "@/constants/Colors";
import tokenService from "@/utils/tokenService";

export default function VerifyingEmailScreen() {
  const { token } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setErrorMessage("No verification token found");
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);

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

          await tokenService.saveTokens(data.accessToken, data.refreshToken);
          await AsyncStorage.setItem("emailVerified", "true");

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Email Verified",
              body: "Your email has been successfully verified!",
            },
            trigger: null,
          });

          setVerificationStatus("success");

          setTimeout(() => {
            handleContinue(data.accessToken);
          }, 1500);
        } else {
          setVerificationStatus("error");
          setErrorMessage("Verification failed. The link may have expired.");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setVerificationStatus("error");
        setErrorMessage("An error occurred during verification");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleTryAgain = () => {
    router.replace("/account?form=login");
  };

  const handleContinue = (token: string) => {
    router.replace({
      pathname: "/onboarding",
      params: { verified: "true", token: token },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}>
        <View className="flex-1 p-6 justify-between">
          <View className="items-center mt-8">
            <Image
              source={
                colorScheme === "dark"
                  ? require("@/assets/images/icon.png")
                  : require("@/assets/images/adaptive-icon.png")
              }
              style={{ width: 90, height: 90 }}
              resizeMode="contain"
            />

            <View className="mt-8 items-center">
              <Text
                className="text-3xl text-center"
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_700Bold",
                  letterSpacing: 0.5,
                }}>
                {verificationStatus === "loading" && "Verifying Your "}
                {verificationStatus === "success" && "Email "}
                {verificationStatus === "error" && "Verification "}
                <Text style={{ color: theme.primary }}>
                  {verificationStatus === "loading" && "Email"}
                  {verificationStatus === "success" && "Verified"}
                  {verificationStatus === "error" && "Failed"}
                </Text>
              </Text>

              <Text
                className="text-lg text-center mt-4 px-6"
                style={{
                  color: theme.secondaryText,
                  fontFamily: "OpenSans",
                  letterSpacing: 0.25,
                }}>
                {verificationStatus === "loading" &&
                  "Please wait while we verify your email address..."}
                {verificationStatus === "success" &&
                  "Your email has been successfully verified!"}
                {verificationStatus === "error" && errorMessage}
              </Text>
            </View>
          </View>

          <View className="flex-1 justify-center items-center my-4">
            {verificationStatus === "loading" && (
              <ActivityIndicator size="large" color={theme.primary} />
            )}

            {verificationStatus === "success" && (
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.primary + "20" }}>
                <Text className="text-4xl">✓</Text>
              </View>
            )}

            {verificationStatus === "error" && (
              <View
                className="pt-1 w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.errorText + "20" }}>
                <Text className="text-4xl" style={{ color: theme.primaryText }}>
                  ✕
                </Text>
              </View>
            )}

            <View
              className="w-full p-4 rounded-lg mt-8"
              style={{ backgroundColor: theme.cardBackground }}>
              <Text
                className="text-base"
                style={{
                  color: theme.primaryText,
                  fontFamily: "OpenSans",
                  textAlign: "center",
                }}>
                {verificationStatus === "loading" &&
                  "Connecting to server and processing your verification token..."}
                {verificationStatus === "success" &&
                  "You can now continue to the app with full access to all features."}
                {verificationStatus === "error" &&
                  "You can try again by requesting a new verification email from the login screen."}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            {verificationStatus === "loading" ? (
              <View
                className="rounded-lg py-4 px-8 items-center w-full mb-4"
                style={{
                  backgroundColor: theme.primary,
                  opacity: 0.7,
                }}>
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color={theme.background} />
                  <Text
                    className="text-base ml-2"
                    style={{
                      color: theme.background,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Verifying...
                  </Text>
                </View>
              </View>
            ) : verificationStatus === "success" ? (
              <TouchableOpacity
                onPress={() => {
                  handleContinue(
                    Array.isArray(token) ? token[0] : String(token)
                  );
                }}
                className="rounded-lg py-4 px-8 items-center w-full mb-4"
                style={{
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 5,
                }}>
                <Text
                  className="text-base"
                  style={{
                    color: theme.background,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Continue
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleTryAgain}
                className="rounded-lg py-4 px-8 items-center w-full mb-4"
                style={{
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 5,
                }}>
                <Text
                  className="text-base"
                  style={{
                    color: theme.background,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Return to Login
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
