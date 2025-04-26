import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, SafeAreaView, Image, Animated, Easing, Dimensions, Modal, Alert } from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from 'expo-router';
import axios, { isAxiosError } from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import WebView from 'react-native-webview';

interface RegisterScreenProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

// Define the registration form schema using Zod
const userSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters long" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// TypeScript type for form data
type UserRegistrationData = z.infer<typeof userSchema>;

export default function RegisterScreen({ setIsAuthenticated }: RegisterScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const animation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const webViewRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationData>({
    resolver: zodResolver(userSchema),
  });

  const username = useWatch({ control, name: 'username' });
  const email = useWatch({ control, name: 'email' });
  const password = useWatch({ control, name: 'password' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });
  const firstName = useWatch({ control, name: 'firstName' });
  const lastName = useWatch({ control, name: 'lastName' });

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      const response = await api.post("/api/auth/register", data);
      if (response.status === 200) {
        Alert.alert('Success', response.data);
        router.push('/login');
        setError(null);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setError(err.response.data);
      } else {
        setError('An error occurred. Please try again later.');
        console.error(err);
      }
    }
  };

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const animateStep = (direction: 'next' | 'back') => {
    const toValue = direction === 'next' ? step : step - 2;
    Animated.timing(animation, {
      toValue,
      duration: 400,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setStep(direction === 'next' ? step + 1 : step - 1);
    });
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return username && email;
      case 2:
        return password && confirmPassword && password === confirmPassword;
      case 3:
        return firstName && lastName;
      default:
        return false;
    }
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <View style={styles.formStep}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Username</Text>
              <Controller
                control={control}
                name="username"
                defaultValue=""
                key={'username'}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, theme.input, { width: screenWidth + 1 }]}
                    placeholder="Username"
                    placeholderTextColor="darkgray"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
              <Controller
                control={control}
                name="email"
                key={'email'}
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, theme.input, { width: screenWidth + 1}]}
                    placeholder="Email"
                    placeholderTextColor="darkgray"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.formStep}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
              <Controller
                control={control}
                name="password"
                key={'password'}
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, theme.input, { width: screenWidth + 1 }]}
                    placeholder="Password"
                    placeholderTextColor="darkgray"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                key={'confirmPassword'}
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, theme.input, { width: screenWidth + 1 }]}
                    placeholder="Confirm Password"
                    placeholderTextColor="darkgray"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.formStep}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>First Name</Text>
              <Controller
                control={control}
                name="firstName"
                key={'firstName'}
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, theme.input, { width: screenWidth + 1 }]}
                    placeholder="First Name"
                    placeholderTextColor="darkgray"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Last Name</Text>
              <Controller
                control={control}
                name="lastName"
                key={'lastName'}
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, theme.input, { width: screenWidth + 2}]}
                    placeholder="Last Name"
                    placeholderTextColor="darkgray"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {(errors.username || errors.email || errors.password || errors.confirmPassword) && (
              <Text style={styles.errorText}>
                {errors.username && <Text>{errors.username.message}</Text> || errors.email && <Text>{errors.email.message}</Text> || errors.password && <Text>{errors.password.message}</Text> || errors.confirmPassword && <Text>{errors.confirmPassword.message}</Text>}
              </Text>
              )}
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}
                <>
                  <Text style={{color: theme.secondaryText, textAlign: 'center', marginTop: 16 }}>
                    By signing up, you agree to our{' '}
                    <Text
                      style={{ textDecorationLine: 'underline', color: theme.primary }}
                      onPress={() => setFlyoutVisible(true)}
                    >
                      Terms of Use
                    </Text>{' '}
                    and{' '}
                    <Text
                      style={{ textDecorationLine: 'underline', color: theme.primary }}
                      onPress={() => setFlyoutVisible(true)}
                    >
                      Privacy Policy
                    </Text>
                  </Text>

                  <Modal
                    visible={flyoutVisible}
                    style={{ margin: 0 }}
                    presentationStyle="formSheet"
                    hardwareAccelerated={true}
                    onRequestClose={() => setFlyoutVisible(false)}
                    animationType="slide"
                  >
                    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
                        <TouchableOpacity 
                          style={[styles.closeButton, { alignSelf: 'flex-end', backgroundColor: theme.cardBackground, margin: 8, opacity: 0.6 }]}
                          onPress={() => setFlyoutVisible(false)}>
                          <Text style={[styles.closeButtonText, {color: theme.primaryText}]}>✕</Text>
                        </TouchableOpacity>
                      <WebView
                        source={{
                          uri: 'https://ingredigo-compliancy.s3.us-east-1.amazonaws.com/terms_of_service.htm',
                        }}
                        style={{ backgroundColor: 'transparent', flex: 1, padding: 16 }}
                      />
                    </SafeAreaView>
                  </Modal>
                </>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAwareScrollView scrollEnabled={false} keyboardDismissMode='on-drag' contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
                source={require('@/assets/images/icon.png')}
                style={[
                  {
              width: 100,
              height: 100,
              padding: 10,
              shadowColor: theme.primaryText,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 5,
                  }
                ]}
              />
            <Text style={[styles.title, { color: theme.text }]}>
              Sign up for <Text style={{ color: theme.primary }}>Ingredi</Text>
                <Text style={{ color: theme.secondary, fontStyle: 'italic' }}>Go</Text>
            </Text>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              Create your account to get started
            </Text>
          </View>

          <View style={styles.form}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.stepsContainer}>
              <Animated.View
                style={[
                  styles.formStep,
                  { transform: [{ translateX: step1TranslateX }] },
                ]}>
                {renderStep(1)}
              </Animated.View>

              <Animated.View
                style={[
                  styles.formStep,
                  { transform: [{ translateX: step2TranslateX }] },
                ]}>
                {renderStep(2)}
              </Animated.View>

              <Animated.View
                style={[
                  styles.formStep,
                  { transform: [{ translateX: step3TranslateX }] },
                ]}>
                {renderStep(3)}
              </Animated.View>
            </View>

            <View style={styles.formAction}>
              {step < 3 ? (
                <TouchableOpacity
                  onPress={() => animateStep('next')}
                  disabled={isSubmitting || !isStepValid(step)}>
                  <View style={[styles.btn, { backgroundColor: theme.primary, borderColor: theme.primary, opacity: (isSubmitting || !isStepValid(step)) ? 0.5 : 1 }]}>
                    <Text style={styles.btnText}>Next</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <>
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting || !isStepValid(step)}>
                  <View style={[ styles.btn, { backgroundColor: theme.primary, borderColor: theme.primary, opacity: (isSubmitting || !isStepValid(step)) ? 0.5 : 1 }]}>
                    <Text style={styles.btnText}>{isSubmitting ? 'Signing up...' : 'Sign up'}</Text>
                  </View>
                </TouchableOpacity>
                </>
              )}
              {step > 1 && (
                <TouchableOpacity
                  onPress={() => animateStep('back')}
                  disabled={isSubmitting}>
                  <View style={[styles.btn, { backgroundColor: theme.secondary, borderColor: theme.secondary }]}>
                    <Text style={styles.btnText}>Back</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View>
            <TouchableOpacity
              onPress={() => {
                router.push('/login');
            }}>
              <Text style={[styles.formFooter, { color: theme.text }]}>
                Already have an account?{' '}
                <Link href="/login">
                  <Text style={{ textDecorationLine: 'underline' }}>Sign in</Text>
                </Link>
              </Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 75,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  form: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  stepsContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    marginBottom: 16,
  },
  formStep: {
    position: 'absolute', // Ensure each step can overlap others
    width: '100%',
  },
  inputContainer: {
    marginBottom: 12,
    width: '100%',
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 60,
    marginHorizontal: -25, // Offset the container padding
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  btn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 5,
    color: '#f74a4a',
  },
  formAction: {
    marginTop: 0,
    marginBottom: 0,
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 19,
    fontWeight: '400',
  },
});