import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { darkTheme, lightTheme } from "@/constants/Colors";
import { QUESTIONS } from "@/components/onboarding/questions";
import VerifyEmail from "@/components/onboarding/VerifyEmail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { RatingForm } from "@/components/onboarding/RatingForm";
import * as StoreReview from "expo-store-review";

const TOTAL_STEPS = QUESTIONS.length + 6;

interface Option {
  id: string;
  label: string;
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const router = useRouter();
  const { email, verified, token } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const isVerified = verified === "true" || token != null;
        if (isVerified && currentStep === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setCurrentStep(1);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    checkVerification();
  }, [verified, currentStep]);

  const handleOptionSelect = (optionId: string) => {
    Haptics.selectionAsync();
    setAnswers((prev) => ({ ...prev, [currentStep]: optionId }));
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartFreeTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep(currentStep + 1);
  };

  const renderContent = () => {
    if (currentStep === 0) {
      return (
        <VerifyEmail
          email={typeof email === "string" ? email : email?.[0] || ""}
        />
      );
    }

    if (currentStep === QUESTIONS.length + 1) {
      return <RatingForm />;
    }

    if (currentStep === QUESTIONS.length + 2) {
      setTimeout(() => {
        router.replace({ pathname: "/trial", params: { token: token } });
      }, 2000);
      return (
        <View className="flex-1 p-6 justify-center items-center">
          <Animated.View entering={FadeIn.duration(800)} className="mb-4">
            <ActivityIndicator size="large" color={theme.secondaryText} />
          </Animated.View>
          <Animated.Text
            className="text-center mt-4 mb-20"
            entering={FadeIn.duration(600)}
            style={{
              color: `${theme.secondaryText}60`,
              fontFamily: "Montserrat_700Bold",
              fontSize: 20,
            }}>
            Customizing your experience
          </Animated.Text>
        </View>
      );
    }

    const currentQuestion = QUESTIONS[currentStep - 1];
    if (!currentQuestion) return null;

    return (
      <View className="flex-1 p-6">
        <Animated.Text
          className="mb-10 text-center"
          entering={FadeIn.duration(600)}
          style={{
            color: theme.primaryText,
            fontFamily: "Montserrat_600SemiBold",
            fontSize: 24,
          }}>
          {currentQuestion.question}
        </Animated.Text>
        {currentQuestion.options.map((option: Option, index: number) => (
          <Animated.View
            entering={FadeInDown.duration(600).delay(index * 100)}
            key={option.id}>
            <TouchableOpacity
              style={[
                {
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: `${theme.divider}40`,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: "transparent",
                },
                answers[currentStep] === option.id && {
                  backgroundColor: `${theme.primary}40`, // Adding 40 hex opacity for a lighter shade
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => handleOptionSelect(option.id)}>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  fontWeight:
                    answers[currentStep] === option.id ? "600" : "500",
                  color:
                    answers[currentStep] === option.id
                      ? theme.primary
                      : theme.primaryText,
                }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  const shouldShowProgress = currentStep > 0 && currentStep <= QUESTIONS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {shouldShowProgress && (
        <OnboardingProgress
          currentStep={currentStep - 1}
          totalSteps={QUESTIONS.length}
          onBack={handleBack}
        />
      )}
      {renderContent()}
      {currentStep > 0 && currentStep < QUESTIONS.length + 2 && (
        <View
          style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: colorScheme === "dark" ? theme.divider : "#F5F5F5",
            shadowColor: colorScheme === "dark" ? "#000" : "#888",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 5,
            backgroundColor: theme.background,
            position: "relative",
            zIndex: 10,
          }}>
          <Animated.View entering={FadeIn.duration(600)}>
            <TouchableOpacity
              className="rounded-lg py-4 px-8 items-center w-full mb-4"
              style={[
                { backgroundColor: theme.primary },
                currentStep > 0 &&
                currentStep <= QUESTIONS.length &&
                !answers[currentStep]
                  ? { opacity: 0.5 }
                  : {
                      shadowColor: theme.primary,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 10,
                      elevation: 5,
                      opacity: 1,
                    },
              ]}
              onPress={handleContinue}
              disabled={
                currentStep > 0 &&
                currentStep <= QUESTIONS.length &&
                !answers[currentStep]
              }>
              <Text
                className="text-base"
                style={{
                  color: theme.background,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                Continue
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={FadeIn.duration(600)}>
            <TouchableOpacity
              className="rounded-lg py-4 px-8 items-center w-full border-[1.5px]"
              style={{
                borderColor: theme.divider,
              }}
              onPress={handleContinue}>
              <Text
                className="text-base"
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                Skip
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}
