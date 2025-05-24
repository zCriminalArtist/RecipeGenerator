import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "react-native";
import axios from "axios";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";
import { darkTheme, lightTheme } from "@/constants/Colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoginForm from "@/components/ui/LoginForm";
import RegisterForm from "@/components/ui/RegisterForm";

interface LoginFormProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export default function AccountScreen({ setIsAuthenticated }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const [signUpWidth, setSignUpWidth] = useState(0);
  const [displayedForm, setDisplayedForm] = useState<"login" | "register">(
    "login"
  );

  const initialFormRef = useRef<string | null>(null);

  const signUpWidthRef = useRef(0);

  useEffect(() => {
    const form = params.form as string;
    console.log("Form parameter:", form);

    if (form === "register" || form === "login") {
      initialFormRef.current = form;

      if (form === "login") {
        setTimeout(() => {
          transitionToForm(form);
        }, 100);
      }
    }
  }, []);

  const transitionToForm = (targetForm: "login" | "register") => {
    Haptics.selectionAsync();
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      const isRegisterForm = targetForm === "register";
      setIsSignUp(isRegisterForm);

      const currentWidth = signUpWidthRef.current;

      Animated.timing(animatedValue, {
        toValue: isRegisterForm ? currentWidth - 10 : 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start();

      setDisplayedForm(targetForm);

      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        delay: 50,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}>
      <View
        className="relative flex-row py-3 justify-around rounded-lg mx-5 mt-4"
        style={{ backgroundColor: theme.secondaryBackground }}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 5,
            right: 5,
            width: "50%",
            backgroundColor: theme.background,
            borderRadius: 5,
            marginVertical: 5,
            transform: [{ translateX: animatedValue }],
          }}
        />
        <TouchableOpacity
          className="py-2.5 flex-1 items-center"
          onPress={() => transitionToForm("login")}>
          <Text
            className="font-semibold text-base"
            style={{
              color: !isSignUp ? theme.primaryText : theme.secondaryText,
              fontFamily: isSignUp
                ? "Montserrat_500Medium"
                : "Montserrat_600SemiBold",
            }}>
            Sign in
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-2.5 flex-1 items-center"
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            setSignUpWidth(width);
            signUpWidthRef.current = width;

            if (initialFormRef.current === "register") {
              initialFormRef.current = null;
              setTimeout(() => {
                transitionToForm("register");
              }, 100);
            }
          }}
          onPress={() => transitionToForm("register")}>
          <Text
            className="font-semibold text-base"
            style={{
              color: isSignUp ? theme.primaryText : theme.secondaryText,
              fontFamily: isSignUp
                ? "Montserrat_600SemiBold"
                : "Montserrat_500Medium",
            }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
      <Animated.View className="flex-1" style={{ opacity: fadeAnimation }}>
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {displayedForm === "register" ? (
            <RegisterForm />
          ) : (
            <LoginForm setIsAuthenticated={setIsAuthenticated} />
          )}
        </KeyboardAwareScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
