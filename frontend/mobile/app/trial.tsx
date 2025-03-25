import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TrialScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const router = useRouter();

  return (
    // <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
    //   <ScrollView contentContainerStyle={styles.scrollContainer}>
    //     <View style={styles.container}>
    //       <Text style={[styles.title, { color: theme.text }]}>Let's get started</Text>
    //       <Text style={[styles.subtitle, { color: theme.text }]}>How your free trial works</Text>
    //       <Text style={[styles.rating, { color: theme.text }]}>4.8 on App store (21k reviews)</Text>

    //       <View style={styles.trialInfo}>
    //         <View style={styles.trialStep}>
    //           <Text style={[styles.stepTitle, { color: Colors.light.text }]}>Today</Text>
    //           <Text style={[styles.stepDescription, { color: Colors.light.text }]}>
    //             Get instant access and see how Buddy can improve your financial life.
    //           </Text>
    //         </View>
    //         <View style={styles.trialStep}>
    //           <Text style={[styles.stepTitle, { color: Colors.light.text }]}>Day 5</Text>
    //           <Text style={[styles.stepDescription, { color: Colors.light.text }]}>
    //             We'll remind you with a notification that your trial is ending soon.
    //           </Text>
    //         </View>
    //         <View style={styles.trialStep}>
    //           <Text style={[styles.stepTitle, { color: Colors.light.text }]}>Day 7</Text>
    //           <Text style={[styles.stepDescription, { color: Colors.light.text }]}>
    //             Your subscription starts. Cancel before that to avoid payment.
    //           </Text>
    //         </View>
    //       </View>

    //       <Text style={[styles.trialPrice, { color: theme.text }]}>
    //         7 days free, then $71.98/year (57% off)
    //       </Text>
    //       <Text style={[styles.trialNote, { color: theme.text }]}>
    //         That's only $1.38/week, billed annually
    //       </Text>

    //       <TouchableOpacity onPress={() => router.push('/login')} style={[styles.continueButton, { backgroundColor: theme.primary }]}>
    //         <Text style={styles.continueButtonText}>Continue</Text>
    //       </TouchableOpacity>

    //       <TouchableOpacity onPress={() => router.push('/login')}>
    //         <Text style={[styles.seePlans, { color: theme.primary }]}>See all plans</Text>
    //       </TouchableOpacity>
    //     </View>
    //   </ScrollView>
    // </SafeAreaView>
//   );
// }
<SafeAreaView style={[styles.container, {  backgroundColor: theme.primary}]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.closeButtonContainer}>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.startedText}>Let's get started</Text>
        <Text style={styles.trialTitle}>How your free trial works</Text>

        <View style={styles.trialCard}>
          <View style={styles.timeline}>
            <View style={[styles.timelineBar, { backgroundColor: theme.secondary } ]} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker]}>
                <Icon name="lock" style={styles.lockIcon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Today</Text>
                <Text style={styles.timelineText}>
                  Get instant access and learn how you can cook with ingredients you already have.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker]}>
                <Icon name="notifications" style={styles.bellIcon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Day 3</Text>
                <Text style={styles.timelineText}>
                  We'll remind you with a notification that your trial is ending soon.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker]}>
              <Icon name="star" style={styles.starIcon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Day 5</Text>
                <Text style={styles.timelineText}>
                  Your subscription starts. Cancel before that to avoid payment.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.pricingTitle}>5 days free, then $4.99/month</Text>

        <View style={styles.securedContainer}>
          <View style={styles.securedIcon}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.securedText}>Secured by Apple</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/login')} style={[styles.continueButton, { backgroundColor: theme.secondaryText }]}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  startedText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '500',
  },
  trialTitle: {
    color: 'white',
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 52,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  starIcon: {
    color: 'white',
    fontSize: 18,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
  },
  trialCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 20,
  },
  timelineBar: {
    position: 'absolute',
    left: 25,
    top: 0,
    bottom: 15,
    width: 20,
    borderRadius: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  timelineMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lockIcon: {
    fontSize: 18,
    color: 'white',
  },
  bellIcon: {
    fontSize: 18,
    color: 'white',
  },
  markerStarIcon: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 7,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDay: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  timelineText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  pricingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  securedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderColor: '#DDD',
    borderWidth: 1,
    alignSelf: 'center',
    paddingHorizontal: 12,
    padding: 8,
    borderRadius: 30,
  },
  securedIcon: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkIcon: {
    color: 'white',
    fontSize: 14,
  },
  securedText: {
    color: '#666',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#9747FF',
    borderRadius: 30,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  plansButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  plansButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginRight: 8,
  },
  buddyLogo: {
    width: 30,
    height: 30,
    backgroundColor: '#DDD',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyText: {
    color: '#333',
    fontSize: 10,
    fontWeight: '600',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginRight: 5,
  },
  mobbinText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '700',
  },
});