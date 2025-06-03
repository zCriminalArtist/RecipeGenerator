import { useEffect, useState, useContext } from "react";
import * as RNIap from "react-native-iap";
import { Alert, Platform } from "react-native";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AuthContext } from "@/app/(tabs)/_layout";

const skus = Platform.select({
  ios: ["ingredigo_monthly_sub"],
  android: ["ingredigo_monthly_sub"],
}) || ["ingredigo_monthly_sub"];

export function useSubscription() {
  const [products, setProducts] = useState<RNIap.Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { checkAuthStatus } = useContext(AuthContext);

  useEffect(() => {
    const init = async () => {
      try {
        await RNIap.initConnection();
        const subscriptions: RNIap.Subscription[] =
          await RNIap.getSubscriptions({
            skus: skus || [],
          });
        console.log("Available subscriptions:", subscriptions);
        setProducts(subscriptions);
      } catch (err) {
        setError("Failed to load subscription info");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      RNIap.endConnection();
    };
  }, []);

  const subscribe = async () => {
    try {
      const result = await RNIap.requestSubscription({ sku: skus[0] });
      console.log("Purchase result: ", result);
      if (result) {
        const receipt =
          Platform.OS === "ios"
            ? Array.isArray(result)
              ? result[0]?.transactionReceipt
              : result.transactionReceipt
            : Array.isArray(result)
            ? result[0]?.purchaseToken
            : result.purchaseToken;

        if (receipt) {
          try {
            const result = await verifyWithBackend(receipt, skus[0]);
            if (result === 200) {
              console.log("Subscription verified successfully");

              await checkAuthStatus();

              router.push("/");
              console.log("Subscription successful");
            }
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
              setError(
                "Subscription is already associated with an existing account"
              );
              Alert.alert(
                "Subscription Conflict",
                "This subscription is already associated with another account. Please log in to that account to use this subscription.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.push("/account?form=login");
                    },
                  },
                ]
              );
            }
          }
        } else {
          throw new Error("No receipt found");
        }
      }
    } catch (err) {
      setError("Purchase failed");
      console.error(err);
    }
  };

  const verifyWithBackend = async (receipt: string, productId: string) => {
    try {
      const res = await api.post("/api/subscription/verify", {
        platform: Platform.OS,
        receipt,
        productId,
      });

      console.log("Subscription verified:", res.data);
      console.log("Status code:", res.status);
      return res.status;
    } catch (err) {
      setError("Backend verification error");
      console.error("Error verifying subscription with backend:", err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    subscribe,
  };
}
