import { StyleSheet, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  withSpring,
  withSequence,
  useAnimatedStyle,
  interpolateColor,
  useSharedValue,
} from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import * as StoreReview from "expo-store-review";
import { darkTheme, lightTheme } from "@/constants/Colors";

export function RatingForm() {
  const [rating, setRating] = useState(0);
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

  return (
    <View style={styles.ratingContainer}>
      <Animated.Text
        entering={FadeIn.duration(600)}
        style={[styles.ratingTitle, { color: theme.primaryText }]}>
        Give me a rating
      </Animated.Text>
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
            <Animated.View
              key={star}
              entering={FadeInDown.duration(600).delay(300 + index * 100)}>
              <Animated.View style={[styles.starButton, animatedStyle]}>
                <Animated.View style={animatedColor}>
                  <Ionicons
                    name={rating >= star ? "star" : "star-outline"}
                    size={40}
                    color={rating >= star ? "#FF9800" : "#D1D1D1"}
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          );
        })}
      </Animated.View>
      <Animated.Text
        entering={FadeInDown.duration(600).delay(600)}
        style={[styles.ratingSubtitle, { color: theme.secondaryText }]}>
        Made for people like you
      </Animated.Text>
      <Animated.View
        entering={FadeInDown.duration(600).delay(800)}
        style={styles.avatarsContainer}>
        <View style={styles.avatarWrapper}>
          <Animated.Image
            source={require("@/assets/images/avatars/1.png")}
            style={styles.avatarImage}
          />
        </View>
        <View style={[styles.avatarWrapper, { marginLeft: -15 }]}>
          <Animated.Image
            source={require("@/assets/images/avatars/2.png")}
            style={styles.avatarImage}
          />
        </View>
        <View style={[styles.avatarWrapper, { marginLeft: -15 }]}>
          <Animated.Image
            source={require("@/assets/images/avatars/3.png")}
            style={styles.avatarImage}
          />
        </View>
        <View style={[styles.avatarWrapper, { marginLeft: -15 }]}>
          <Animated.Image
            source={require("@/assets/images/avatars/4.png")}
            style={styles.avatarImage}
          />
        </View>
      </Animated.View>
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
  ratingTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 40,
  },
  starButton: {
    padding: 8,
  },
  ratingSubtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    lineHeight: 26,
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
