import {
  View,
  TouchableOpacity,
  Text,
  Linking,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import React, { useState } from "react";
import { darkTheme, lightTheme } from "@/constants/Colors";
import { ActivityIndicator } from "react-native";

type SubscriptionType = "monthly" | "yearly";

interface SubscriptionScreenProps {
  monthlyPrice: string;
  onPurchasePackage: () => void;
  subscriptionType?: SubscriptionType;
}

export function SubscriptionScreen({
  monthlyPrice,
  onPurchasePackage,
  subscriptionType = "yearly", // Default to yearly for free trial
}: SubscriptionScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(false);

  const handleTerms = () => {
    Linking.openURL("https://ingredigo.app/terms");
  };

  const handlePrivacy = () => {
    Linking.openURL("https://ingredigo.app/privacy");
  };

  const handlePurchase = () => {
    setIsLoading(true);

    setTimeout(() => {
      onPurchasePackage();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        entering={FadeIn.duration(600)}
        className="flex-1 px-6 pt-10">
        <Text
          className="text-3xl text-center mb-8"
          style={{
            color: theme.primaryText,
            fontFamily: "Montserrat_700Bold",
            letterSpacing: 0.5,
          }}>
          {subscriptionType === "yearly"
            ? "Start your 7-day FREE trial to continue."
            : "Unlock all IngrediGo features"}
        </Text>

        <Animated.ScrollView
          entering={FadeInDown.duration(600).delay(300)}
          className="mb-8"
          showsVerticalScrollIndicator={false}>
          {subscriptionType === "yearly" && (
            <>
              <View className="flex-row items-start mb-3">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center mr-4"
                  style={{
                    backgroundColor:
                      colorScheme === "dark" ? "#26A87533" : "#26A87522",
                  }}>
                  <Ionicons name="lock-open" size={24} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Today
                  </Text>
                  <Text
                    className="text-base"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                      lineHeight: 20,
                    }}>
                    Unlock all IngrediGo features like AI recipe generation and
                    ingredient scanning.
                  </Text>
                </View>
              </View>

              <View
                className="w-0.5 h-6 ml-5 mb-6"
                style={{ backgroundColor: theme.primary }}
              />

              <View className="flex-row items-start mb-3">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center mr-4"
                  style={{
                    backgroundColor:
                      colorScheme === "dark" ? "#26A87533" : "#26A87522",
                  }}>
                  <Ionicons
                    name="notifications"
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    In 5 Days - Reminder
                  </Text>
                  <Text
                    className="text-base"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                      lineHeight: 20,
                    }}>
                    We'll send you a reminder that your trial is ending soon.
                  </Text>
                </View>
              </View>

              <View
                className="w-0.5 h-6 ml-5 mb-6"
                style={{ backgroundColor: theme.primary }}
              />

              <View className="flex-row items-start mb-3">
                <View
                  className="w-10 h-10 rounded-full justify-center items-center mr-4"
                  style={{
                    backgroundColor:
                      colorScheme === "dark" ? "#26A87533" : "#26A87522",
                  }}>
                  <Ionicons name="card" size={24} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base mb-1"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    In 7 Days - Billing Starts
                  </Text>
                  <Text
                    className="text-base"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "OpenSans",
                      lineHeight: 20,
                    }}>
                    You'll be charged {monthlyPrice} unless you cancel anytime
                    before.
                  </Text>
                </View>
              </View>
            </>
          )}

          {subscriptionType === "monthly" && (
            <>
              <View className="mb-6">
                <Text
                  className="text-lg mb-1"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  ✓ Unlimited Recipe Generation
                </Text>
                <Text
                  className="text-base"
                  style={{
                    color: theme.secondaryText,
                    fontFamily: "OpenSans",
                    lineHeight: 20,
                  }}>
                  Create personalized recipes from your available ingredients
                  without limits
                </Text>
              </View>

              <View className="mb-6">
                <Text
                  className="text-lg mb-1"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  ✓ Advanced Dietary Preferences
                </Text>
                <Text
                  className="text-base"
                  style={{
                    color: theme.secondaryText,
                    fontFamily: "OpenSans",
                    lineHeight: 20,
                  }}>
                  Set detailed food preferences and restrictions for perfect
                  recipe matches
                </Text>
              </View>

              <View className="mb-6">
                <Text
                  className="text-lg mb-1"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  ✓ AI Ingredient Scanner
                </Text>
                <Text
                  className="text-base"
                  style={{
                    color: theme.secondaryText,
                    fontFamily: "OpenSans",
                    lineHeight: 20,
                  }}>
                  Scan your pantry items with your camera for quick ingredient
                  entry
                </Text>
              </View>

              <View className="mb-6">
                <Text
                  className="text-lg mb-1"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  ✓ Recipe Saving & Sharing
                </Text>
                <Text
                  className="text-base"
                  style={{
                    color: theme.secondaryText,
                    fontFamily: "OpenSans",
                    lineHeight: 20,
                  }}>
                  Save your favorite recipes and share them with friends and
                  family
                </Text>
              </View>
            </>
          )}
        </Animated.ScrollView>
      </Animated.View>

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
            ✓ No Commitment - Cancel Anytime
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
          onPress={handlePurchase}
          disabled={isLoading}
          className="rounded-lg py-4 px-8 items-center w-full mb-4"
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
              {subscriptionType === "yearly"
                ? "Start Free Trial"
                : "Start Cooking"}
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center space-x-16">
          <TouchableOpacity onPress={handleTerms}>
            <Text
              className="text-sm"
              style={{
                color: theme.secondaryText,
                fontFamily: "OpenSans",
                textDecorationLine: "underline",
              }}>
              Terms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrivacy}>
            <Text
              className="text-sm"
              style={{
                color: theme.secondaryText,
                fontFamily: "OpenSans",
                textDecorationLine: "underline",
              }}>
              Privacy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
