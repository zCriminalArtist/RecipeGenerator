import { darkTheme, lightTheme } from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";

export default function VerifyEmail({ email }: { email: string }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  // Masked email for privacy
  const maskedEmail = email
    ? `${email.substring(0, 2)}***${email.substring(
        email.lastIndexOf("@") - 1
      )}`
    : "your email";

  return (
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
              Verify Your <Text style={{ color: theme.primary }}>Email</Text>
            </Text>

            <Text
              className="text-lg text-center mt-4 px-6"
              style={{
                color: theme.secondaryText,
                fontFamily: "OpenSans",
                letterSpacing: 0.25,
              }}>
              We've sent a verification email to {maskedEmail}.
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center my-4">
          <View
            className="w-full p-4 rounded-lg mb-6"
            style={{ backgroundColor: theme.cardBackground }}>
            <Text
              className="text-base mb-2"
              style={{
                color: theme.primaryText,
                fontFamily: "OpenSans",
                textAlign: "center",
              }}>
              Click the verification link in your email to automatically verify
              your account.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
