import { darkTheme, lightTheme } from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import * as Notifications from "expo-notifications";

SplashScreen.preventAutoHideAsync();

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();
  const screenHeight = Dimensions.get("window").height;
  const animationRef = useRef<LottieView>(null);

  const [isGetStartedLoading, setIsGetStartedLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleGetStarted = () => {
    setIsGetStartedLoading(true);

    setTimeout(() => {
      router.push("/account?form=register");
      setIsGetStartedLoading(false);
    }, 500); // 1.5 second delay
  };

  const handleLogin = () => {
    setIsLoginLoading(true);

    setTimeout(() => {
      router.push("/account?form=login");
      setIsLoginLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (animationRef.current) {
      setTimeout(() => {
        animationRef.current?.play();
      }, 100);
    }
    (async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return;
      }
    })();
  }, []);

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
              Turn Your Ingredients into Meals with{" "}
              <Text style={{ color: theme.primary }}>AI</Text>
              <Text style={{ color: theme.primaryText }}>!</Text>
            </Text>

            <Text
              className="text-lg text-center mt-4 px-6"
              style={{
                color: theme.secondaryText,
                fontFamily: "OpenSans",
                letterSpacing: 0.25,
              }}>
              Discover personalized recipes instantly.
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center my-8">
          <LottieView
            ref={animationRef}
            source={require("@/assets/animations/welcome-animation.json")}
            style={{ width: 533, height: 400 }}
            loop
          />
        </View>

        <View className="mb-6">
          <TouchableOpacity
            onPress={handleGetStarted}
            disabled={isGetStartedLoading || isLoginLoading}
            className="rounded-lg py-4 px-8 items-center w-full mb-4"
            style={{
              backgroundColor: theme.primary,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isLoginLoading ? 0.0 : 0.8,
              shadowRadius: 10,
              elevation: 5,
              opacity: isGetStartedLoading || isLoginLoading ? 0.7 : 1,
            }}>
            {isGetStartedLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={theme.background} />
                <Text
                  className="text-base ml-2"
                  style={{
                    color: theme.background,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Preparing...
                </Text>
              </View>
            ) : (
              <Text
                className="text-base"
                style={{
                  color: theme.background,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                Get Started
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isGetStartedLoading || isLoginLoading}
            className="rounded-lg py-4 px-8 items-center w-full border-[1.5px]"
            style={{
              borderColor: theme.divider,
              opacity: isGetStartedLoading || isLoginLoading ? 0.7 : 1,
            }}>
            {isLoginLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={theme.primaryText} />
                <Text
                  className="text-base ml-2"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Preparing...
                </Text>
              </View>
            ) : (
              <Text
                className="text-base"
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                I already have an account
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
