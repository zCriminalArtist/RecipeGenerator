import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import axios from "axios";
import api from "@/utils/api";
import tokenService from "@/utils/tokenService";
import { darkTheme, lightTheme } from "@/constants/Colors";
import Icon from "react-native-vector-icons/MaterialIcons";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

interface LoginFormProps {
  setIsAuthenticated?: (isAuthenticated: boolean) => void;
}

export default function LoginForm({ setIsAuthenticated }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post("/api/auth/login", data);

      if (response.status === 200) {
        const { accessToken, refreshToken } = response.data;
        await tokenService.saveTokens(accessToken, refreshToken);

        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        } else {
          router.replace("/");
        }
        setError(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError(err.response.data);
      } else if (axios.isAxiosError(err) && err.response?.status === 402) {
        const { accessToken, refreshToken } = err.response.data;
        await tokenService.saveTokens(accessToken, refreshToken);
        router.replace({
          pathname: "/onboarding",
          params: { email: data.email },
        });
      } else {
        setError("An error occurred. Please try again later.");
        console.error(err);
      }
    }
  };

  return (
    <View className="flex-1 p-6 pt-10 justify-center">
      <Text
        className="text-3xl font-bold my-5"
        style={{ color: theme.primaryText, fontFamily: "Montserrat_700Bold" }}>
        Sign in
      </Text>

      <View className="flex-1">
        {error && (
          <Text
            className="text-sm font-medium my-1"
            style={{ color: theme.errorText }}>
            {error}
          </Text>
        )}

        <View className="mb-4">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: theme.primaryText }}>
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => {
              const [isFocused, setIsFocused] = useState(false);

              return (
                <TextInput
                  className="h-[55px] px-4 text-[15px] font-medium rounded-lg"
                  style={{
                    backgroundColor: theme.input.backgroundColor,
                    borderColor: isFocused
                      ? theme.primary
                      : theme.input.backgroundColor,
                    color: theme.primaryText,
                    borderWidth: 1.5,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="email-address"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur();
                  }}
                  onChangeText={onChange}
                  value={value}
                />
              );
            }}
          />
          {errors.email && (
            <Text
              className="text-sm font-medium mt-1"
              style={{ color: theme.errorText }}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: theme.primaryText }}>
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => {
              const [isPasswordVisible, setPasswordVisible] = useState(false);
              const [isFocused, setIsFocused] = useState(false);

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
                    placeholder="Enter your password"
                    placeholderTextColor={theme.secondaryText}
                    secureTextEntry={!isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setIsFocused(false);
                      onBlur();
                    }}
                    onChangeText={onChange}
                    value={value}
                  />
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
                </View>
              );
            }}
          />
          {errors.password && (
            <Text className="text-[#f74a4a] text-sm font-medium mt-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        <View className="flex-row justify-between my-2.5">
          <TouchableOpacity onPress={() => router.push("/forgot")}>
            <Text
              className="font-medium text-sm"
              style={{ color: theme.primary, fontFamily: "Lato400_Regular" }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-[#26A875] font-medium text-sm">
              Sign in with mobile
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="rounded-lg py-4 items-center mt-4"
          style={{
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 5,
          }}>
          <Text
            className="text-base font-semibold"
            style={{
              color: theme.background,
              fontFamily: "Montserrat_600SemiBold",
            }}>
            Sign In
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-6">
          <View
            className="flex-1 h-[1px]"
            style={{ backgroundColor: theme.divider }}
          />

          <Text
            className="px-2.5 text-sm"
            style={{
              color: theme.secondaryText,
              fontFamily: "OpenSans",
            }}>
            Or login with
          </Text>
          <View
            className="flex-1 h-[1px]"
            style={{ backgroundColor: theme.divider }}
          />
        </View>

        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white rounded-lg py-4 px-5 flex-[0.48]"
            style={{
              backgroundColor: colorScheme === "dark" ? "#F1F3F5" : "#2C2F33",
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
              backgroundColor: colorScheme === "dark" ? "#F1F3F5" : "#2C2F33",
            }}>
            <Image
              source={require("@/assets/images/google-icon.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text
              className="ml-2 font-semibold text-[#1A1D21]"
              style={{
                color: colorScheme === "dark" ? "#1A1D21" : "#FFFFFF",
              }}>
              Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="self-center mt-auto mb-5">
        <Icon name="fingerprint" size={40} color={theme.primary} />
      </View>
    </View>
  );
}
