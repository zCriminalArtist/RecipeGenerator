import { useEffect, useState } from "react";
import * as RNIap from "react-native-iap";
import { Platform } from "react-native";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const skus = Platform.select({
  ios: ["ingredigo_monthly_sub"],
  android: ["ingredigo_monthly_sub"],
}) || ["ingredigo_monthly_sub"];

export function useSubscription(token: string | string[]) {
  const [products, setProducts] = useState<RNIap.Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      const result = await RNIap.requestPurchase({ sku: skus[0] });
      console.log("Purchase result", result);
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
          const result = await verifyWithBackend(receipt, skus[0]);
          if (result === 200) {
            if (typeof token === "string") {
              await AsyncStorage.setItem("jwt", token);
            } else {
              throw new Error("Invalid token type");
            }
            router.push("/");
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
      const res = await api.post(
        "/api/subscription/verify",
        {
          platform: Platform.OS,
          receipt,
          productId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Subscription verified:", res.data);
      return res.status;
    } catch (err) {
      setError("Backend verification error");
      console.error(err);
      throw err; // Re-throw the error to handle it outside if needed
    }
  };

  return {
    products,
    loading,
    error,
    subscribe,
  };
}
