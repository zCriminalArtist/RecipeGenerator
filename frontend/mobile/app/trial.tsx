import React from "react";
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
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";

export default function TrialScreen() {
  const colorScheme = useColorScheme();
  const { token } = useLocalSearchParams();
  const { products, loading, error, subscribe } = useSubscription(token);
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <Text style={styles.startedText}>Let's get started</Text>
        <Text style={styles.trialTitle}>How your free trial works</Text>
        <Text style={styles.subtitleText}>
          Instant AI-powered recipes based on what's in your fridge
        </Text>

        <View style={styles.trialCard}>
          <View style={styles.timeline}>
            <View
              style={[styles.timelineBar, { backgroundColor: theme.secondary }]}
            />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker]}>
                <Icon name="lock" style={styles.lockIcon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Today</Text>
                <Text style={styles.timelineText}>
                  Get instant access and learn how you can cook with ingredients
                  you already have.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker]}>
                <Icon name="notifications" style={styles.bellIcon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Day 3</Text>
                <Text style={styles.timelineText}>
                  We'll remind you with a notification that your trial is ending
                  soon.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker]}>
                <Icon name="star" style={styles.starIcon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Day 7</Text>
                <Text style={styles.timelineText}>
                  Your subscription starts. Cancel before that to avoid payment.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.pricingTitle}>7 days free, then $4.99/month</Text>

        <View style={styles.securedContainer}>
          <View style={styles.securedIcon}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.securedText}>Secured by Apple</Text>
        </View>

        <TouchableOpacity
          onPress={subscribe}
          style={[
            styles.continueButton,
            {
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 1,
            },
          ]}
        >
          <Text style={styles.continueButtonText}>Start Cooking Smarter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButtonContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  subtitleText: {
    color: "white",
    maxWidth: "80%",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 20,
  },
  startedText: {
    color: "white",
    fontSize: 28,
    fontWeight: "500",
  },
  trialTitle: {
    color: "white",
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 52,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  starIcon: {
    color: "white",
    fontSize: 20,
  },
  ratingText: {
    color: "white",
    fontSize: 16,
  },
  trialCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  timeline: {
    position: "relative",
    paddingLeft: 5,
  },
  timelineBar: {
    position: "absolute",
    left: 10,
    top: 0,
    bottom: 15,
    width: 20,
    borderRadius: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 30,
  },
  timelineMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  lockIcon: {
    fontSize: 18,
    color: "white",
  },
  bellIcon: {
    fontSize: 20,
    color: "white",
  },
  markerStarIcon: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 7,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDay: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  timelineText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  pricingSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  securedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderColor: "#DDD",
    borderWidth: 0,
    alignSelf: "center",
    paddingHorizontal: 12,
    padding: 8,
    borderRadius: 30,
  },
  securedIcon: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkIcon: {
    color: "white",
    fontSize: 14,
  },
  securedText: {
    color: "#555",
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: "#9747FF",
    borderRadius: 30,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
  },
  plansButton: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  plansButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#000",
    alignSelf: "center",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    marginRight: 8,
  },
  buddyLogo: {
    width: 30,
    height: 30,
    backgroundColor: "#DDD",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  buddyText: {
    color: "#333",
    fontSize: 10,
    fontWeight: "600",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
    marginRight: 5,
  },
  mobbinText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "700",
  },
});
