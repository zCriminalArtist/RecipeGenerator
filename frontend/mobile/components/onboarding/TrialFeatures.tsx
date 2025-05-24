import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "@/constants/Colors";
import { useState } from "react";

interface TrialFeaturesProps {
  monthlyPrice: string;
  onStartFreeTrial: () => void;
}

export function TrialFeatures({
  monthlyPrice,
  onStartFreeTrial,
}: TrialFeaturesProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = () => {
    setIsLoading(true);

    setTimeout(() => {
      onStartFreeTrial();
      setIsLoading(false);
    }, 500);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1">
        <Animated.View
          entering={FadeIn.duration(600)}
          className="items-center p-8 pb-0">
          <Text
            className="text-3xl font-bold text-center mb-10"
            style={{
              color: theme.primaryText,
              fontFamily: "Montserrat_700Bold",
              letterSpacing: 0.5,
            }}>
            I want you to try IngrediGo for free.
          </Text>

          <View className="w-full h-[400px] mt-5 items-center justify-center">
            <Animated.View
              entering={FadeIn.delay(300).duration(800)}
              className="bg-[#26A87510] rounded-xl p-6 w-full"
              style={{
                borderWidth: 1,
                borderColor: `${theme.primary}30`,
              }}>
              <Text
                className="text-xl mb-5 font-bold"
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_700Bold",
                }}>
                IngrediGo can help you:
              </Text>

              <View className="mb-4 flex-row">
                <View className="w-8 h-8 rounded-full bg-[#26A87530] items-center justify-center mr-3">
                  <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                    1
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Turn pantry items into meals
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                    }}>
                    Transform whatever you have on hand into delicious recipes
                    without grocery shopping.
                  </Text>
                </View>
              </View>

              <View className="mb-4 flex-row">
                <View className="w-8 h-8 rounded-full bg-[#26A87530] items-center justify-center mr-3">
                  <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                    2
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Save time and reduce waste
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                    }}>
                    Get instant recipe ideas that use ingredients before they
                    expire, cutting food waste and saving money.
                  </Text>
                </View>
              </View>

              <View className="mb-4 flex-row">
                <View className="w-8 h-8 rounded-full bg-[#26A87530] items-center justify-center mr-3">
                  <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                    3
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Discover new recipe ideas
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                    }}>
                    Break out of cooking ruts with AI-generated recipes that
                    bring fresh inspiration to your kitchen.
                  </Text>
                </View>
              </View>

              <View className="flex-row">
                <View className="w-8 h-8 rounded-full bg-[#26A87530] items-center justify-center mr-3">
                  <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                    4
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Cook with confidence
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                    }}>
                    Get clear instructions and ingredient combinations that
                    actually work, powered by advanced AI.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
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
            Just {monthlyPrice} per month
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleStartTrial}
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
          <Text
            className="text-base"
            style={{
              color: theme.background,
              fontFamily: "Montserrat_600SemiBold",
            }}>
            Try for $0.00
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
