import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, lightTheme, darkTheme } from '@/constants/Colors';
import ContentLoader, { Rect } from 'react-content-loader/native';
import api from '../utils/api';

interface Subscription {
  subscriptionId: string;
  subscriptionDescription: string;
  subscribedOn: string;
  nextPaymentDate: string;
  price: string;
  trialEndsOn?: string;
}

const SubscriptionScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
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

    fetchSubscriptions();
  }, []);

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await api.delete(`/api/subscription/cancel`);
      setSubscriptions(subscriptions.filter(sub => sub.subscriptionId !== subscriptionId));
      Alert.alert('Success', 'Subscription cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel subscription', error);
      Alert.alert('Error', 'Failed to cancel subscription');
    }
  };

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
                  <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Subscribed On</Text>
                  <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                    {item.subscribedOn}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                  <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Next Payment Date</Text>
                  <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                    {item.nextPaymentDate}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                  <Text style={[styles.label, { fontWeight: '600', color: theme.primaryText }]}>Amount</Text>
                  <Text style={[styles.label, { fontWeight: '500', alignContent: 'flex-end', marginRight: 20, color: theme.secondaryText }]}>
                    {item.price}
                  </Text>
                </View>
                {item.trialEndsOn && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 }}>
                    <Text style={[styles.label, { color: 'red', fontWeight: '600' }]}>Trial ends on {item.trialEndsOn}</Text>
                    <Text style={[styles.label, { color: 'red', fontWeight: '600', alignContent: 'flex-start', marginRight: 20 }]}>
                      
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.cardBackground }]}
                  onPress={() => handleCancelSubscription(item.subscriptionId)}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel Subscription</Text>
                </TouchableOpacity>
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