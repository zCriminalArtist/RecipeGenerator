import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Platform,
  Animated,
  useColorScheme,
} from "react-native";
import { Link, Stack, router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import api from "@/utils/api";

interface SubscriptionData {
  status: string;
  expirationDate: string; // Next billing date
  purchaseDate: string;
  isTrial: boolean;
  isAutoRenew: boolean;
  cancellationDate?: string;
  platform?: string;
}

export default function SubscriptionSettingsScreen() {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const contentOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchSubscriptionData();

    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/subscription/status");
      setSubscriptionData(response.data);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      Alert.alert("Error", "Failed to load subscription information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    const url = "https://apps.apple.com/account/subscriptions";

    try {
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Cannot Open Link",
          "Unable to open subscription management. Please manually navigate to your App Store account to manage your subscription.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error opening subscription management:", error);
      Alert.alert(
        "Error",
        "There was a problem opening subscription management"
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string, isTrial: boolean) => {
    if (isTrial) return "#FFB74D"; // Orange for trial

    switch (status?.toLowerCase()) {
      case "active":
        return "#26A875"; // Green
      case "canceled":
      case "cancelled":
      case "expired":
        return colorScheme === "dark" ? "#ff6b6b" : "#e53935"; // Red
      default:
        return theme.secondaryText;
    }
  };

  const getStatusIcon = (status: string, isTrial: boolean) => {
    if (isTrial) return "av-timer"; // Timer icon for trial

    switch (status?.toLowerCase()) {
      case "active":
        return "check-circle";
      case "canceled":
      case "cancelled":
      case "expired":
        return "cancel";
      default:
        return "help";
    }
  };

  const getStatusText = (status: string, isTrial: boolean) => {
    if (isTrial) return "Trial";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatInfoRow = (label: string, value: string | boolean) => {
    // Handle boolean values specially
    const displayValue =
      typeof value === "boolean" ? (value ? "Yes" : "No") : value;

    return (
      <View className="flex-row justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700">
        <Text
          className="text-base"
          style={{
            color: theme.primaryText,
            fontFamily: "Montserrat_500Medium",
          }}>
          {label}
        </Text>
        <Text
          className="text-base"
          style={{
            color: theme.secondaryText,
            fontFamily: "Montserrat_400Regular",
          }}>
          {displayValue}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background }}
      className="flex-1">
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Subscription",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: "#8BDBC1",
          headerTitleStyle: {
            fontFamily: "Montserrat_700Bold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-2">
              <Icon name="arrow-back" size={24} color="#8BDBC1" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1">
        <Animated.View
          className="px-6 pt-6 pb-8"
          style={{
            opacity: headerOpacity,
            backgroundColor: theme.headerBackground,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}>
          <View className="items-center mb-4">
            {subscriptionData?.status && !isLoading ? (
              <View className="items-center">
                <View
                  className="h-20 w-20 rounded-full items-center justify-center mb-2"
                  style={{
                    backgroundColor: getStatusColor(
                      subscriptionData.status,
                      subscriptionData.isTrial
                    ),
                  }}>
                  <Icon
                    name={getStatusIcon(
                      subscriptionData.status,
                      subscriptionData.isTrial
                    )}
                    size={40}
                    color="white"
                  />
                </View>
                <Text
                  className="text-xl mb-2"
                  style={{
                    color: "#8BDBC1",
                    fontFamily: "Montserrat_700Bold",
                  }}>
                  {getStatusText(
                    subscriptionData.status,
                    subscriptionData.isTrial
                  )}{" "}
                  Subscription
                </Text>
                <Text
                  className="text-center opacity-70"
                  style={{
                    color: theme.secondaryText,
                    fontFamily: "Montserrat_400Regular",
                  }}>
                  {subscriptionData.cancellationDate
                    ? `Your subscription will end on ${formatDate(
                        subscriptionData.expirationDate
                      )}`
                    : subscriptionData.isTrial
                    ? `Your trial ends on ${formatDate(
                        subscriptionData.expirationDate
                      )}`
                    : subscriptionData.isAutoRenew
                    ? `Auto-renews on ${formatDate(
                        subscriptionData.expirationDate
                      )}`
                    : `Your subscription is active until ${formatDate(
                        subscriptionData.expirationDate
                      )}`}
                </Text>
              </View>
            ) : !isLoading ? (
              <View className="items-center">
                <View
                  className="h-20 w-20 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: theme.secondaryText }}>
                  <Icon name="help" size={40} color="white" />
                </View>
                <Text
                  className="text-xl"
                  style={{
                    color: "#8BDBC1",
                    fontFamily: "Montserrat_700Bold",
                  }}>
                  No Active Subscription
                </Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#26A875" />
            )}
          </View>
        </Animated.View>

        <Animated.View
          className="px-6 pt-6"
          style={{ opacity: contentOpacity }}>
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="large" color="#26A875" />
            </View>
          ) : subscriptionData ? (
            <View>
              <View className="bg-white dark:bg-[#2C2F33] rounded-xl p-4 shadow-sm mb-6">
                <Text
                  className="text-lg mb-4"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Subscription Details
                </Text>
                {formatInfoRow(
                  "Status",
                  getStatusText(
                    subscriptionData.status,
                    subscriptionData.isTrial
                  )
                )}
                {formatInfoRow("Trial Subscription", subscriptionData.isTrial)}
                {formatInfoRow("Auto-Renewal", subscriptionData.isAutoRenew)}
                {formatInfoRow(
                  subscriptionData.isTrial
                    ? "Trial Ends On"
                    : "Next Billing Date",
                  formatDate(subscriptionData.expirationDate)
                )}
                {formatInfoRow(
                  "Started On",
                  formatDate(subscriptionData.purchaseDate)
                )}
                {subscriptionData.cancellationDate &&
                  formatInfoRow(
                    "Cancellation Date",
                    formatDate(subscriptionData.cancellationDate)
                  )}
                {subscriptionData.platform &&
                  formatInfoRow("Platform", subscriptionData.platform)}
              </View>

              <View className="flex-1 bg-white dark:bg-[#2C2F33] rounded-xl p-4 shadow-sm mb-6">
                <Text
                  className="text-lg mb-6"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Manage Your Subscription
                </Text>

                <Text
                  className="flex-1 mb-6"
                  style={{
                    color: theme.secondaryText,
                    fontFamily: "Montserrat_400Regular",
                    wordWrap: "wrap",
                    textAlign: "center",
                    flexWrap: "wrap",
                  }}>
                  {subscriptionData.isTrial
                    ? `Your trial will ${
                        subscriptionData.isAutoRenew
                          ? "automatically convert to a paid subscription"
                          : "expire"
                      } on ${formatDate(subscriptionData.expirationDate)}.`
                    : `To modify or cancel your subscription, you'll need to visit your ${
                        Platform.OS === "ios" ? "App Store" : "Play Store"
                      } account settings.`}
                </Text>

                <TouchableOpacity
                  className="bg-[#26A875] py-3 px-4 rounded-md self-center w-full"
                  onPress={handleManageSubscription}>
                  <Text
                    className="text-white font-medium text-center"
                    style={{ fontFamily: "Montserrat_500Medium" }}>
                    {subscriptionData.isTrial && !subscriptionData.isAutoRenew
                      ? "Upgrade to Full Subscription"
                      : `Manage Subscription in ${
                          Platform.OS === "ios" ? "App Store" : "Play Store"
                        }`}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="bg-white dark:bg-[#2C2F33] rounded-xl p-4 shadow-sm mb-10">
                <Text
                  className="text-lg mb-2"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Frequently Asked Questions
                </Text>

                {subscriptionData.isTrial && (
                  <View className="mt-2 mb-3">
                    <Text
                      className="mb-1 text-base"
                      style={{
                        color: theme.primaryText,
                        fontFamily: "Montserrat_500Medium",
                      }}>
                      What happens when my trial ends?
                    </Text>
                    <Text
                      style={{
                        color: theme.secondaryText,
                        fontFamily: "Montserrat_400Regular",
                      }}>
                      {subscriptionData.isAutoRenew
                        ? "Your trial will automatically convert to a paid subscription when it ends. You can cancel anytime before then to avoid being charged."
                        : "Your trial will expire on the end date and you'll need to subscribe to continue using premium features."}
                    </Text>
                  </View>
                )}

                <View
                  className={subscriptionData.isTrial ? "mb-3" : "mt-2 mb-3"}>
                  <Text
                    className="mb-1 text-base"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_500Medium",
                    }}>
                    How do I{" "}
                    {subscriptionData.isAutoRenew ? "turn off" : "enable"}{" "}
                    auto-renewal?
                  </Text>
                  <Text
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "Montserrat_400Regular",
                    }}>
                    You can manage auto-renewal through your{" "}
                    {Platform.OS === "ios" ? "App Store" : "Play Store"} account
                    settings.{" "}
                    {subscriptionData.isAutoRenew
                      ? "Turning it off will let your subscription run until the end date without renewing."
                      : "Enabling it ensures uninterrupted service."}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text
                    className="mb-1 text-base"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_500Medium",
                    }}>
                    Will I lose my recipes if I cancel?
                  </Text>
                  <Text
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "Montserrat_400Regular",
                    }}>
                    Your saved recipes will remain available in read-only mode
                    after your subscription ends.
                  </Text>
                </View>

                <View>
                  <Text
                    className="mb-1 text-base"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_500Medium",
                    }}>
                    How do I get help with billing issues?
                  </Text>
                  <Text
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "Montserrat_400Regular",
                    }}>
                    For billing issues, please contact{" "}
                    {Platform.OS === "ios" ? "Apple support" : "Google support"}{" "}
                    directly as they handle all payment processing.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-white dark:bg-[#2C2F33] rounded-xl p-6 shadow-sm mb-6 items-center">
              <Icon name="error-outline" size={50} color={theme.errorText} />
              <Text
                className="text-lg mt-3 text-center"
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                No Subscription Information
              </Text>
              <Text
                className="mt-2 text-center"
                style={{
                  color: theme.secondaryText,
                  fontFamily: "Montserrat_400Regular",
                }}>
                We couldn't find any subscription details for your account.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-[#26A875] py-2 px-6 rounded-md"
                onPress={() => {
                  Linking.openURL(
                    "https://apps.apple.com/account/subscriptions"
                  );
                }}>
                <Text
                  className="text-white font-medium"
                  style={{ fontFamily: "Montserrat_500Medium" }}>
                  View Subscription Plans
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
