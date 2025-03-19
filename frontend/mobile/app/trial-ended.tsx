import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Alert, Button } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useLocalSearchParams } from "expo-router";
import { WebView } from 'react-native-webview';
import { CardField, CardForm, confirmSetupIntent, createPaymentMethod, StripeProvider, useStripe } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import api from '@/utils/api';

export default function TrialEndedScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [url, setUrl] = useState<string | null>(null);

  const handleSubscribe = async () => {
    const customerId = params?.id || 'Default Name';
    console.log(customerId);
    const paymentIntent = params?.paymentIntent || 'Default Name';
    console.log(paymentIntent);
    if (customerId && typeof customerId === 'string') {
        const { error } = await initPaymentSheet({
            customerId: customerId,
            paymentIntentClientSecret: Array.isArray(paymentIntent) ? paymentIntent[0] : paymentIntent,
            merchantDisplayName: 'IngrediGo',
            returnURL: Linking.createURL("payment-complete"),
            applePay: {
                merchantCountryCode: "US",
              },
        });

        if (!error) {
            const { error: sheetError } = await presentPaymentSheet();

            if (sheetError) {
                Alert.alert('Payment Failed', sheetError.message);
            } else {
                Alert.alert('Success', 'Your subscription is active!');
            }
        } else {
            console.error(error.message);
            Alert.alert('Error', 'Failed to initialize payment sheet.');
        }
    } else {
      console.error('Invalid id:', customerId);
    }
  };

// const handleAttachPaymentMethod = async () => {
//     const clientSecret = Array.isArray(params?.id) ? params.id[0] : params?.id;
//     console.log(clientSecret);
//     if (!clientSecret) {
//         Alert.alert('Error', 'Client secret not found.');
//         return;
//     }

//     const { error } = await confirmSetupIntent(clientSecret, {
//         paymentMethodType: 'Card',
//     });

//     if (error) {
//         Alert.alert('Error', error.message || 'Failed to attach payment method.');
//     } else {
//         Alert.alert('Success', 'Payment method saved for future billing!');
//     }
// };

// const handleSubscribe = async () => {
//     try {
//         const { paymentMethod } = await createPaymentMethod({
//             paymentMethodType: 'Card',
//         });

//         const response = await api.post(
//             'http://localhost:8080/api/stripe/set-payment-method',
//             {
//                 paymentMethodId: paymentMethod?.id,
//             }
//         );

//         Alert.alert('Success', 'Subscription created successfully!');

//     } catch (error) {
//         Alert.alert('Error', 'Failed to create subscription.');
//     }
// };

  if (url) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {/* <TouchableOpacity onPress={() => setUrl(null)} style={styles.webViewCloseButton}>
            <Text style={styles.webViewCloseButtonText}>✕</Text>
          </TouchableOpacity> */}
          <WebView source={{ uri: url }} onNavigationStateChange={(event) => {
                        if (event.url.includes('/success')) {
                            Alert.alert('Payment Successful!');
                            setUrl(null);
                        }
                        if (event.url.includes('/cancel')) {
                            Alert.alert('Payment Canceled');
                            setUrl(null);
                        }
                    }} style={{ flex: 1 }} />
        </View>
      </SafeAreaView>
    );
  }

    const publishableKey = process.env.EXPO_PUBLIC_STRIPE_KEY || 'default_publishable_key';
    console.log('Publishable key:', publishableKey);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>The everyday package</Text>
          {/* <Image source={require('@/assets/icons.png')} style={styles.image} /> */}

          {/* <StripeProvider publishableKey={publishableKey}>
            <Text style={{ marginBottom: 20, fontSize: 20 }}>
                Subscribe for $5/m onth
            </Text>

            <CardForm
                style={{
                    width: '100%',
                    height: 135,
                    marginVertical: 20,
                }}
            />


            <Button title="Subscribe Now" onPress={handleAttachPaymentMethod} />
            </StripeProvider> */}

          <View style={styles.pricing}>
            <TouchableOpacity style={styles.pricingOption}>
              <Text style={[styles.pricingText, { color: theme.text }]}>Yearly $125.98</Text>
              <Text style={[styles.pricingSubText, { color: theme.text }]}>$10.49 / month</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save $42</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pricingOption}>
              <Text style={[styles.pricingText, { color: theme.text }]}>Monthly $13.98</Text>
              <Text style={[styles.pricingSubText, { color: theme.text }]}>$13.98 / month</Text>
            </TouchableOpacity>
          </View>
          <StripeProvider publishableKey={publishableKey}
          merchantIdentifier="merchant.com.ingredigo">
          <TouchableOpacity onPress={handleSubscribe} style={[styles.subscribeButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
          </StripeProvider>
        </View>
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
  closeButton: {
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 20,
  },
  features: {
    width: '100%',
    marginVertical: 20,
  },
  feature: {
    fontSize: 16,
    marginBottom: 10,
  },
  pricing: {
    width: '100%',
    marginVertical: 20,
  },
  pricingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  pricingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pricingSubText: {
    fontSize: 14,
  },
  saveBadge: {
    backgroundColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  subscribeButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  webViewCloseButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  webViewCloseButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});