import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import ContentLoader, { Rect } from 'react-content-loader/native';
import api from '../utils/api';
import axios from 'axios';
import { initPaymentSheet, presentPaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import * as Linking from "expo-linking";

interface Subscription {
  subscriptionId: string;
  subscriptionDescription: string;
  subscribedOn: string;
  nextPaymentDate: string;
  paymentMethod?: string;
  price: string;
  trialEndsOn?: string;
  status: string;
}

const SubscriptionScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/api/subscription/list');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Failed to fetch subscriptions', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await api.delete(`/api/subscription/cancel`);
      // setSubscriptions(subscriptions.filter(sub => sub.subscriptionId !== subscriptionId));
      await fetchSubscriptions();
      Alert.alert('Success', 'Subscription cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel subscription', error);
      Alert.alert('Error', 'Failed to cancel subscription');
    }
  };

  const handleSubscribe = async (subscriptionId: string) => {
    try {
      const response = await api.post(`/api/subscription/activate`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        const { customerId, paymentIntentClientSecret } = error.response.data;
        router.push({
          pathname: '/trial-ended',
          params: { id: customerId, paymentIntent: paymentIntentClientSecret },
        });
      } else {
        Alert.alert('Error', 'Error fetching recipes');
        console.error(error);
      }
    }
  };

  const handleUpdatePayment = async (subscriptionId: string) => {
    try {
      const response = await api.post('/api/subscription/update');
      const { customerId, clientSecret } = response.data;
      const { error } = await initPaymentSheet({
            customerId: customerId,
            setupIntentClientSecret: clientSecret,
            merchantDisplayName: 'IngrediGo',
            returnURL: Linking.createURL("payment-complete"),
            applePay: {
                merchantCountryCode: "US",
              },
        });

        if (!error) {
            const { error: sheetError } = await presentPaymentSheet();

            if (sheetError) {
                Alert.alert('Update Failed', sheetError.message);
            } else {
                Alert.alert('Success', 'Your payment details have been updated');
                await fetchSubscriptions();
            }
        } else {
            console.error(error.message);
            Alert.alert('Error', 'Failed to initialize payment sheet.');
        }
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment method');
      console.error(error);
    }
  };

  const handleRestartSubscription = async (subscriptionId: string) => {
    try {  
      await api.post(`/api/subscription/restart`);
      // setSubscriptions(subscriptions.filter(sub => sub.subscriptionId !== subscriptionId));
      await fetchSubscriptions();
      Alert.alert('Success', 'Subscription reactivated successfully');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        const { customerId, paymentIntentClientSecret } = error.response.data;
        router.push({
          pathname: '/trial-ended',
          params: { id: customerId, paymentIntent: paymentIntentClientSecret },
        });
      } else {
        console.error(error);
      }
    }
  };

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_KEY || 'default_publishable_key';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Subscription Details</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.container}>
        {loading ? (
          <ContentLoader
            speed={1}
            width="100%"
            height={500}
            backgroundColor={theme.background}
            foregroundColor={theme.secondaryText}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="100%" height="200" />
          </ContentLoader>
        ) : (
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.subscriptionId}
            renderItem={({ item }) => (
              <View style={[styles.subscriptionItem]}>
                <Text style={[styles.label, { fontSize: 20, color: theme.primaryText }]}>
                  {item.subscriptionDescription ? item.subscriptionDescription : "AI Recipe Generator Subscription"}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
                  <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Started On</Text>
                  <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                    {item.subscribedOn}
                  </Text>
                </View>
                {item.status === 'trialing' ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <Text style={[styles.label, { color: 'red', fontWeight: '600' }]}>Trial ends on {item.trialEndsOn}</Text>
                    <Text style={[styles.label, { color: 'red', fontWeight: '600', alignContent: 'flex-start', marginRight: 20 }]} />
                  </View>
                ) : item.status === 'trial_expired' || item.status === 'canceled' ? (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <Text style={[styles.label, { color: 'red', fontWeight: '600' }]}>Expired</Text>
                      <Text style={[styles.label, { color: 'red', fontWeight: '600', alignContent: 'flex-start', marginRight: 20 }]} />
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
                      onPress={() => handleSubscribe(item.subscriptionId)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text }]}>Subscribe</Text>
                    </TouchableOpacity>
                  </>
                ) : item.status === 'past_due' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
                    onPress={() => handleUpdatePayment(item.subscriptionId)}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>Update Payment</Text>
                  </TouchableOpacity>
                ) : item.status === 'canceled_pending' ? (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <Text style={[styles.label, { maxWidth: '90%', lineHeight: 30, flexWrap: 'wrap', color: theme.primaryText, fontWeight: '600' }]}>You can use your subscription until {item.nextPaymentDate}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
                      onPress={() => handleRestartSubscription(item.subscriptionId)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text }]}>Restart Subscription</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Next Payment Date</Text>
                      <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                        {item.nextPaymentDate}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Payment Method</Text>
                      <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                        {item.paymentMethod}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                      <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Amount</Text>
                      <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                    {item.price}
                      </Text>
                    </View>
                    <StripeProvider publishableKey={publishableKey}
                              merchantIdentifier="merchant.com.ingredigo">
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
                          onPress={() => handleUpdatePayment(item.subscriptionId)}
                      >
                        <Text style={[styles.actionButtonText, { color: theme.text }]}>Setup Auto Payment</Text>
                      </TouchableOpacity>
                    </StripeProvider>
                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: theme.cardBackground }]}
                      onPress={() => handleCancelSubscription(item.subscriptionId)}
                    >
                      <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel Subscription</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    marginVertical: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24, // Same width as the close button to balance the layout
  },
  container: {
    flex: 1,
    padding: 12,
  },
  subscriptionItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  label: {
    alignContent: 'flex-start',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubscriptionScreen;