import {
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  withSpring,
  withSequence,
  useAnimatedStyle,
  interpolateColor,
  useSharedValue,
  BounceIn,
} from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import * as StoreReview from "expo-store-review";
import { darkTheme, lightTheme } from "@/constants/Colors";

export function RatingForm() {
  const [rating, setRating] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const star1 = useSharedValue(0);
  const star2 = useSharedValue(0);
  const star3 = useSharedValue(0);
  const star4 = useSharedValue(0);
  const star5 = useSharedValue(0);
  const animatedStars = [star1, star2, star3, star4, star5];
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const delay = 500;
    const animationInterval = 200;

    setTimeout(() => {
      animatedStars.forEach((star, index) => {
        setTimeout(() => {
          star.value = withSequence(
            withSpring(1.2, { damping: 8 }),
            withSpring(1, { damping: 8 })
          );
          setRating(index + 1);
        }, index * animationInterval);
      });
    }, delay);
  }, []);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
    setHasInteracted(true);

    // Animate the selected star and previous stars
    animatedStars.forEach((star, index) => {
      if (index < selectedRating) {
        star.value = withSequence(
          withSpring(1.3, { damping: 6 }),
          withSpring(1, { damping: 6 })
        );
      }
    });
  };

  const getFeedbackText = () => {
    if (!hasInteracted) return "";
    if (rating <= 2) return "We're constantly improving!";
    if (rating === 3) return "Thanks for your feedback!";
    if (rating === 4) return "Awesome! We're glad you like it!";
    return "Fantastic! Would you mind leaving a review?";
  };

  return (
    <View style={styles.ratingContainer}>
      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.headerContainer}>
        <Animated.Text
          entering={BounceIn.duration(800)}
          style={[styles.ratingTitle, { color: theme.primaryText }]}>
          LOVE THE APP?
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.duration(600).delay(400)}
          style={[styles.ratingSubheader, { color: theme.secondaryText }]}>
          Let us know how we're doing!
        </Animated.Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: animatedStars[index].value * 0.3 + 1 }],
            };
          });

          const animatedColor = useAnimatedStyle(() => ({
            backgroundColor: interpolateColor(
              animatedStars[index].value,
              [0, 1],
              ["transparent", "transparent"]
            ),
          }));

          return (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              activeOpacity={0.7}>
              <Animated.View
                entering={FadeInDown.duration(600).delay(300 + index * 100)}>
                <Animated.View style={[styles.starButton, animatedStyle]}>
                  <Animated.View style={animatedColor}>
                    <Ionicons
                      name={rating >= star ? "star" : "star-outline"}
                      size={48}
                      color={rating >= star ? "#FFC107" : "#D1D1D1"}
                    />
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {hasInteracted && (
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[
            styles.feedbackText,
            {
              color: rating >= 4 ? "#26A875" : theme.secondaryText,
            },
          ]}>
          {getFeedbackText()}
        </Animated.Text>
      )}

      {rating >= 4 && hasInteracted && (
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.reviewButtonContainer}>
          <TouchableOpacity
            style={[styles.reviewButton, { backgroundColor: theme.primary }]}
            onPress={() => StoreReview.requestReview()}>
            <Text style={styles.reviewButtonText}>Rate on App Store</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ratingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  ratingTitle: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 12,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
  },
  ratingSubheader: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  starButton: {
    padding: 8,
  },
  feedbackText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 24,
  },
  reviewButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  reviewButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reviewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  avatarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
