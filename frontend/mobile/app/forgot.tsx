import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import api from "@/utils/api";
import { Colors, lightTheme, darkTheme } from "@/constants/Colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";

// Define the form schemas using Zod
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters long"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

// TypeScript types for form data
type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const handleEmail = async (data: EmailForm) => {
    try {
      const response = await api.post(
        `/api/auth/request-reset?email=${data.email}`
      );
      if (response.status === 200) {
        setEmail(data.email);
        setStep("reset");
        setError(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data);
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setEmail(data.email);
        setStep("reset");
        setError(err.response.data);
      } else {
        setError("An error occurred. Please try again later.");
        console.error(err);
      }
    }
  };

  const handleCode = async (data: ResetForm) => {
    try {
      const response = await api.post(
        `/api/auth/reset-password?token=${data.code}&newPassword=${data.newPassword}`
      );
      if (response.status === 200) {
        Alert.alert("Success", "Password has been reset successfully");
        router.push("/account");
        setError(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data);
      } else {
        setError("An error occurred. Please try again later.");
        console.error(err);
      }
    }
  };

  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAwareScrollView
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Forgot Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              {step === "email"
                ? "Enter your email to receive a reset code"
                : "Enter the reset code and your new password"}
            </Text>
          </View>

          <View style={styles.form}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {step === "email" ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Email
                  </Text>
                  <Controller
                    control={emailControl}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, theme.input]}
                        placeholder="john@example.com"
                        placeholderTextColor="darkgray"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {emailErrors.email && (
                    <Text style={styles.errorText}>
                      {emailErrors.email.message}
                    </Text>
                  )}
                </View>

                <View style={styles.formAction}>
                  <TouchableOpacity
                    onPress={handleEmailSubmit(handleEmail)}
                    disabled={isEmailSubmitting}>
                    <View
                      style={[
                        styles.btn,
                        {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}>
                      <Text style={styles.btnText}>
                        {isEmailSubmitting ? "Sending..." : "Send Reset Code"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Reset Code
                  </Text>
                  <Controller
                    key="code"
                    control={resetControl}
                    name="code"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, theme.input]}
                        placeholder="Enter reset code"
                        placeholderTextColor="darkgray"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {resetErrors.code && (
                    <Text style={styles.errorText}>
                      {resetErrors.code.message}
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    New Password
                  </Text>
                  <Controller
                    control={resetControl}
                    name="newPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, theme.input]}
                        placeholder="********"
                        placeholderTextColor="darkgray"
                        secureTextEntry
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {resetErrors.newPassword && (
                    <Text style={styles.errorText}>
                      {resetErrors.newPassword.message}
                    </Text>
                  )}
                </View>

                <View style={styles.formAction}>
                  <TouchableOpacity
                    onPress={handleResetSubmit(handleCode)}
                    disabled={isResetSubmitting}>
                    <View
                      style={[
                        styles.btn,
                        {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}>
                      <Text style={styles.btnText}>
                        {isResetSubmitting ? "Resetting..." : "Reset Password"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 24,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 100,
  },
  title: {
    fontSize: 31,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  form: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  inputContainer: {
    marginBottom: 12,
    width: "100%",
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 60,
    width: "150%",
    marginHorizontal: -25, // Offset the container padding
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderStyle: "solid",
  },
  btn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 10,
    color: "red",
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
});
