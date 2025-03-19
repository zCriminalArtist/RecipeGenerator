import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function TrialScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: theme.text }]}>Let's get started</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>How your free trial works</Text>
          <Text style={[styles.rating, { color: theme.text }]}>4.8 on App store (21k reviews)</Text>

          <View style={styles.trialInfo}>
            <View style={styles.trialStep}>
              <Text style={[styles.stepTitle, { color: Colors.light.text }]}>Today</Text>
              <Text style={[styles.stepDescription, { color: Colors.light.text }]}>
                Get instant access and see how Buddy can improve your financial life.
              </Text>
            </View>
            <View style={styles.trialStep}>
              <Text style={[styles.stepTitle, { color: Colors.light.text }]}>Day 5</Text>
              <Text style={[styles.stepDescription, { color: Colors.light.text }]}>
                We'll remind you with a notification that your trial is ending soon.
              </Text>
            </View>
            <View style={styles.trialStep}>
              <Text style={[styles.stepTitle, { color: Colors.light.text }]}>Day 7</Text>
              <Text style={[styles.stepDescription, { color: Colors.light.text }]}>
                Your subscription starts. Cancel before that to avoid payment.
              </Text>
            </View>
          </View>

          <Text style={[styles.trialPrice, { color: theme.text }]}>
            7 days free, then $71.98/year (57% off)
          </Text>
          <Text style={[styles.trialNote, { color: theme.text }]}>
            That's only $1.38/week, billed annually
          </Text>

          <TouchableOpacity onPress={() => router.push('/login')} style={[styles.continueButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.seePlans, { color: theme.primary }]}>See all plans</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  rating: {
    fontSize: 16,
    marginTop: 10,
  },
  trialInfo: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  trialStep: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 16,
    marginTop: 5,
  },
  trialPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  trialNote: {
    fontSize: 14,
    marginTop: 5,
  },
  continueButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seePlans: {
    marginTop: 20,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});