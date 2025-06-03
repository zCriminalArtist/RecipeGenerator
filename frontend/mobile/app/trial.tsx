import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { useColorScheme } from "react-native";
import { Colors, lightTheme, darkTheme } from "@/constants/Colors";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSubscription } from "@/hooks/useSubscription";
import { TrialFeatures } from "@/components/onboarding/TrialFeatures";
import * as Haptics from "expo-haptics";
import { TrialReminder } from "@/components/onboarding/TrialReminder";
import { SubscriptionScreen } from "@/components/onboarding/SubscriptionScreen";

export default function TrialScreen() {
  const colorScheme = useColorScheme();
  const { products, loading, error, subscribe } = useSubscription();
  const monthlyPrice = "$4.99";
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [page, setPage] = useState(0);

  const handleStartFreeTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPage(page + 1);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }]}>
      {page === 0 && (
        <TrialFeatures
          monthlyPrice={monthlyPrice}
          onStartFreeTrial={handleStartFreeTrial}
        />
      )}
      {page === 1 && (
        <TrialReminder
          monthlyPrice={monthlyPrice}
          onStartFreeTrial={handleStartFreeTrial}
        />
      )}
      {page === 2 && (
        <SubscriptionScreen
          monthlyPrice={monthlyPrice}
          onPurchasePackage={subscribe}
        />
      )}
    </SafeAreaView>
  );
}
