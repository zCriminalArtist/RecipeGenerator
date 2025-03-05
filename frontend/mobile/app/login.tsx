import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface LoginScreenProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

// Define the login form schema using Zod
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// TypeScript type for form data
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen({ setIsAuthenticated }: LoginScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
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
        const { token } = response.data;
        await AsyncStorage.setItem('jwt', token);
        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        } else {
          router.push('/');
        }
        setError(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again later.');
        console.error(err);
      }
    }
  };

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background} ]}>
      <KeyboardAwareScrollView keyboardDismissMode='on-drag' contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
              Sign in to <Text style={{ color: theme.primary }}>Ingredi</Text>
                <Text style={[{ color: theme.secondary, fontStyle: 'italic' }]}>Go</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
              Get access to recipes and more
          </Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel,{ color: theme.text }]}>Email</Text>
            <Controller
              control={control}
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
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
            <Controller
              control={control}
              name="password"
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
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>
          
          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}>
              <View style={[ styles.btn, { backgroundColor: theme.primary, borderColor: theme.primary, }]}>
                <Text style={styles.btnText}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              // handle link
            }}>
            <Text style={[ styles.formLink, { color: theme.primary }]}>Forgot password?</Text>
          </TouchableOpacity>
        
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              router.push('/register');
          }}>
            <Text style={[styles.formFooter, { color: theme.text }]}>
              Don't have an account?{' '}
              <Link href="/register">
                <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
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
    marginVertical: 100,
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
    width: '150%',
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
    marginVertical: 10,
    color: 'red',
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    color: 'blue',
    marginTop: 16,
    textAlign: 'center',
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  lightText: {
    color: '#1D2A32',
  },
  darkText: {
    color: '#fff',
  },
});