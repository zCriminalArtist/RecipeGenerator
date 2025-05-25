import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useRouter } from "expo-router";
import axios, { isAxiosError } from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";
import { Colors, lightTheme, darkTheme } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import WebView from "react-native-webview";
import Icon from "react-native-vector-icons/MaterialIcons";

const userSchema = z
  .object({
    username: z.string().min(1, { message: "Username is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters long",
    }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserRegistrationData = z.infer<typeof userSchema>;

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const animation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const webViewRef = useRef(null);
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  // Add state to track form step heights
  const [stepHeights, setStepHeights] = useState({
    step1: 0,
    step2: 0,
    step3: 0,
  });

  // Create refs for each step view
  const step1Ref = useRef<View>(null);
  const step2Ref = useRef<View>(null);
  const step3Ref = useRef<View>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<UserRegistrationData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
  });

  const username = useWatch({ control, name: "username" });
  const email = useWatch({ control, name: "email" });
  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });
  const firstName = useWatch({ control, name: "firstName" });
  const lastName = useWatch({ control, name: "lastName" });

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      const isValid = await trigger(["firstName", "lastName"]);
      if (!isValid) return;

      const response = await api.post("/api/auth/register", data);
      if (response.status === 200) {
        router.replace({ pathname: "/onboarding", params: { email: email } });
        setError(null);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data);
      } else {
        setError("An error occurred. Please try again later.");
        console.error(err);
      }
    }
  };

  const socialLoginOpacity = useRef(new Animated.Value(1)).current;

  const animateStep = async (direction: "next" | "back") => {
    if (direction === "next") {
      // Validate current step before proceeding
      let isValid = true;
      if (step === 1) {
        isValid = await trigger(["username", "email"]);
        if (isValid) {
          Animated.timing(socialLoginOpacity, {
            toValue: 0,
            delay: 300,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } else if (step === 2) {
        isValid = await trigger(["password", "confirmPassword"]);
      }

      if (!isValid) return;

      const toValue = step;
      Animated.timing(animation, {
        toValue,
        duration: 400,
        delay: 300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setStep(step + 1);
      });
    } else {
      const toValue = step - 2;
      Animated.timing(animation, {
        toValue,
        duration: 400,
        delay: 50,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setStep(step - 1);

        if (step === 2) {
          Animated.timing(socialLoginOpacity, {
            toValue: 1,
            duration: 400,
            delay: 0,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return username && email && !errors.username && !errors.email;
      case 2:
        return (
          password &&
          confirmPassword &&
          password === confirmPassword &&
          !errors.password &&
          !errors.confirmPassword
        );
      case 3:
        return firstName && lastName && !errors.firstName && !errors.lastName;
      default:
        return false;
    }
  };

  const renderInputField = (
    fieldName: keyof UserRegistrationData,
    label: string,
    placeholder: string,
    isSecure: boolean = false
  ) => {
    return (
      <View className="mb-4">
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: theme.primaryText }}>
          {label}
        </Text>
        <Controller
          control={control}
          name={fieldName}
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => {
            const [isFocused, setIsFocused] = useState(false);
            const [isPasswordVisible, setPasswordVisible] = useState(false);

            return (
              <View className="flex-row items-center relative">
                <TextInput
                  className="flex-1 h-[55px] px-4 text-[15px] font-medium rounded-lg"
                  style={{
                    backgroundColor: theme.input.backgroundColor,
                    borderColor: isFocused
                      ? theme.primary
                      : theme.input.backgroundColor,
                    color: theme.primaryText,
                    borderWidth: 1.5,
                  }}
                  placeholder={placeholder}
                  placeholderTextColor={theme.secondaryText}
                  secureTextEntry={isSecure && !isPasswordVisible}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur();
                  }}
                  onChangeText={onChange}
                  value={value}
                />
                {isSecure && (
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!isPasswordVisible)}
                    className="absolute right-4"
                    activeOpacity={0.7}>
                    <Icon
                      name={isPasswordVisible ? "visibility" : "visibility-off"}
                      size={20}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
        {errors[fieldName] && (
          <Text
            className="text-sm font-medium mt-1"
            style={{ color: theme.errorText }}>
            {errors[fieldName]?.message as string}
          </Text>
        )}
      </View>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      measureStepHeights();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const measureStepHeights = () => {
    if (step1Ref.current) {
      step1Ref.current.measure((_x, _y, _width, height) => {
        setStepHeights((prev) => ({ ...prev, step1: height }));
      });
    }

    if (step2Ref.current) {
      step2Ref.current.measure((_x, _y, _width, height) => {
        setStepHeights((prev) => ({ ...prev, step2: height }));
      });
    }

    if (step3Ref.current) {
      step3Ref.current.measure((_x, _y, _width, height) => {
        setStepHeights((prev) => ({ ...prev, step3: height }));
      });
    }
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <View
            ref={step1Ref}
            onLayout={() => {
              setTimeout(() => {
                step1Ref.current?.measure((_x, _y, _width, height) => {
                  setStepHeights((prev) => ({ ...prev, step1: height }));
                });
              }, 50);
            }}>
            {renderInputField("username", "Username", "Enter your username")}
            {renderInputField("email", "Email", "Enter your email", false)}
          </View>
        );
      case 2:
        return (
          <View
            ref={step2Ref}
            onLayout={() => {
              setTimeout(() => {
                step2Ref.current?.measure((_x, _y, _width, height) => {
                  setStepHeights((prev) => ({ ...prev, step2: height }));
                });
              }, 50);
            }}>
            {renderInputField(
              "password",
              "Password",
              "Enter your password",
              true
            )}
            {renderInputField(
              "confirmPassword",
              "Confirm Password",
              "Confirm your password",
              true
            )}
          </View>
        );
      case 3:
        return (
          <View
            ref={step3Ref}
            onLayout={() => {
              setTimeout(() => {
                step3Ref.current?.measure((_x, _y, _width, height) => {
                  setStepHeights((prev) => ({ ...prev, step3: height }));
                });
              }, 50);
            }}>
            {renderInputField(
              "firstName",
              "First Name",
              "Enter your first name"
            )}
            {renderInputField("lastName", "Last Name", "Enter your last name")}
            <Text
              className="text-sm text-center mt-4"
              style={{ color: theme.secondaryText }}>
              By signing up, you agree to my{" "}
              <Text
                className="underline"
                style={{ color: theme.primary }}
                onPress={() => setFlyoutVisible(true)}>
                Terms of Use
              </Text>{" "}
              and{" "}
              <Text
                className="underline"
                style={{ color: theme.primary }}
                onPress={() => setFlyoutVisible(true)}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const buttonPositionY = animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      0,
      stepHeights.step2 - stepHeights.step1,
      stepHeights.step3 - stepHeights.step1,
    ],
  });

  const step1TranslateX = animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -screenWidth, -2 * screenWidth],
  });

  const step2TranslateX = animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [screenWidth, 0, -screenWidth],
  });

  const step3TranslateX = animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [2 * screenWidth, screenWidth, 0],
  });

  return (
    <View className="flex-1 p-6 pt-10">
      <View className="flex-row items-center justify-between my-5">
        <Text
          className="text-3xl font-bold"
          style={{
            color: theme.primaryText,
            fontFamily: "Montserrat_700Bold",
          }}>
          Sign up
        </Text>
        <Image
          source={
            colorScheme === "dark"
              ? require("@/assets/images/icon.png")
              : require("@/assets/images/adaptive-icon.png")
          }
          style={{ width: 35, height: 35, marginRight: 10 }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-1">
        {error && (
          <Text
            className="text-sm font-medium my-1"
            style={{ color: theme.errorText }}>
            {error}
          </Text>
        )}

        <View
          className="relative w-full mb-4"
          style={{
            minHeight:
              Math.min(
                stepHeights.step1,
                stepHeights.step2,
                stepHeights.step3
              ) || 200,
          }}>
          <Animated.View
            className="absolute w-full"
            style={{ transform: [{ translateX: step1TranslateX }] }}>
            {renderStep(1)}
          </Animated.View>

          <Animated.View
            className="absolute w-full"
            style={{ transform: [{ translateX: step2TranslateX }] }}>
            {renderStep(2)}
          </Animated.View>

          <Animated.View
            className="absolute w-full"
            style={{ transform: [{ translateX: step3TranslateX }] }}>
            {renderStep(3)}
          </Animated.View>
        </View>

        <Animated.View
          style={{
            transform: [{ translateY: buttonPositionY }],
          }}>
          <View className="flex-row justify-between mt-4">
            {step > 1 && (
              <TouchableOpacity
                onPress={() => animateStep("back")}
                disabled={isSubmitting}
                className="rounded-lg py-4 px-8 items-center flex-1 mr-2"
                style={{
                  backgroundColor: theme.secondary,
                }}>
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: theme.background,
                    fontFamily: "Montserrat_600SemiBold",
                  }}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={
                step < 3 ? () => animateStep("next") : handleSubmit(onSubmit)
              }
              disabled={isSubmitting || !isStepValid(step)}
              className={`rounded-lg py-4 px-8 items-center flex-1 ${
                step > 1 ? "ml-2" : ""
              }`}
              style={{
                backgroundColor: theme.primary,
                opacity: isSubmitting || !isStepValid(step) ? 0.5 : 1,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: isStepValid(step) ? 10 : 0,
                elevation: 5,
              }}>
              <Text
                className="text-base font-semibold"
                style={{
                  color: theme.background,
                  fontFamily: "Montserrat_600SemiBold",
                }}>
                {step < 3 ? "Next" : isSubmitting ? "Signing up..." : "Sign up"}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: socialLoginOpacity }}>
            <View className="flex-row items-center my-6">
              <View
                className="flex-1 h-[1px]"
                style={{ backgroundColor: theme.divider }}
              />
              <Text
                className="px-2.5 text-sm"
                style={{ color: theme.secondaryText, fontFamily: "OpenSans" }}>
                Or login with
              </Text>
              <View
                className="flex-1 h-[1px]"
                style={{ backgroundColor: theme.divider }}
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg py-4 px-5 flex-[0.48]"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#F1F3F5" : "#2C2F33",
                }}>
                <Icon name="facebook" size={23} color="#1877F2" />
                <Text
                  className="ml-2 font-semibold"
                  style={{
                    color: colorScheme === "dark" ? "#1A1D21" : "#FFFFFF",
                  }}>
                  Facebook
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-lg py-4 px-5 flex-[0.48]"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#F1F3F5" : "#2C2F33",
                }}>
                <Image
                  source={require("@/assets/images/google-icon.png")}
                  style={{ width: 20, height: 20 }}
                />
                <Text
                  className="ml-2 font-semibold"
                  style={{
                    color: colorScheme === "dark" ? "#1A1D21" : "#FFFFFF",
                  }}>
                  Google
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      <Modal
        visible={flyoutVisible}
        style={{ margin: 0 }}
        presentationStyle="formSheet"
        hardwareAccelerated={true}
        onRequestClose={() => setFlyoutVisible(false)}
        animationType="slide">
        <SafeAreaView
          className="flex-1"
          style={{ backgroundColor: theme.background }}>
          <TouchableOpacity
            className="self-end m-2 w-9 h-9 rounded-full items-center justify-center opacity-60"
            style={{ backgroundColor: theme.cardBackground }}
            onPress={() => setFlyoutVisible(false)}>
            <Text className="text-lg" style={{ color: theme.primaryText }}>
              ✕
            </Text>
          </TouchableOpacity>
          <WebView
            source={{
              uri: "https://ingredigo-compliancy.s3.us-east-1.amazonaws.com/terms_of_service.htm",
            }}
            style={{
              backgroundColor: "transparent",
              flex: 1,
              padding: 16,
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
