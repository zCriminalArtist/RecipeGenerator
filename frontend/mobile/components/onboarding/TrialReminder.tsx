import { View, TouchableOpacity, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSequence,
  withRepeat,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { darkTheme, lightTheme } from "@/constants/Colors";
import { ActivityIndicator } from "react-native";

interface TrialReminderProps {
  monthlyPrice: string;
  onStartFreeTrial: () => void;
}

export function TrialReminder({
  monthlyPrice,
  onStartFreeTrial,
}: TrialReminderProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Create a repeating sequence for both animations
    const startAnimations = () => {
      // Bell animation
      rotation.value = withRepeat(
        withSequence(
          withTiming(-0.1, { duration: 200 }),
          withTiming(0.1, { duration: 200 }),
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: 2000 }) // 4-second pause between sequences
        ),
        -1, // Infinite repetitions
        false
      );

      // Badge animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 2400 }) // Matching pause to sync with bell
        ),
        -1, // Infinite repetitions
        false
      );
    };

    // Start with initial delay
    const timeout = setTimeout(startAnimations, 1000);

    // Cleanup
    return () => {
      clearTimeout(timeout);
      rotation.value = 0;
      scale.value = 1;
    };
  }, []);

  const bellAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}rad` }],
    };
  });

  const badgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleContinue = () => {
    setIsLoading(true);

    setTimeout(() => {
      onStartFreeTrial();
      setIsLoading(false);
    }, 1000);
  };

  // Calculate yearly price from monthly
  const yearlyPrice = monthlyPrice;
  const yearlyTotal = `$${(
    parseFloat(monthlyPrice.replace("$", "")) * 12
  ).toFixed(2)}`;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1">
        <Animated.View
          entering={FadeIn.duration(600)}
          className="items-center p-8 pb-0">
          <Text
            className="text-3xl text-center mb-10"
            style={{
              color: theme.primaryText,
              fontFamily: "Montserrat_700Bold",
              letterSpacing: 0.5,
            }}>
            We'll send you a reminder before your free trial ends
          </Text>

          <Animated.View
            entering={FadeIn.duration(600).delay(300)}
            className="my-10"
            style={bellAnimatedStyle}>
            <View className="relative p-5">
              <Ionicons
                name="notifications"
                size={140}
                color={colorScheme === "dark" ? "#555" : "#E5E5E5"}
              />
              <Animated.View
                className="absolute top-5 right-10 bg-red-600 w-8 h-8 rounded-full justify-center items-center"
                style={badgeAnimatedStyle}>
                <Text className="text-white text-sm font-bold">1</Text>
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      <View
        className="p-5 pb-6"
        style={{
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: colorScheme === "dark" ? theme.divider : "#F5F5F5",
        }}>
        <View className="items-center mb-6">
          <Text
            className="text-lg text-center mb-2"
            style={{
              color: theme.primaryText,
              fontFamily: "Montserrat_600SemiBold",
            }}>
            ✓ No Payment Due Now
          </Text>
          <Text
            className="text-base text-center"
            style={{
              color: theme.secondaryText,
              fontFamily: "OpenSans",
            }}>
            Just {yearlyTotal} per year ({yearlyPrice}/mo)
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={isLoading}
          className="rounded-lg py-4 px-8 items-center w-full"
          style={{
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 5,
            opacity: isLoading ? 0.7 : 1,
          }}>
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color={theme.background} />
              <Text
                className="text-base ml-2"
                style={{
                  color: theme.background,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text
              className="text-base"
              style={{
                color: theme.background,
                fontFamily: "Montserrat_600SemiBold",
              }}>
              Continue for FREE
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
