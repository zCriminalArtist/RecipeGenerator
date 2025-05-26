import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useColorScheme,
  Linking,
} from "react-native";
import { Stack, router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import api from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
}

export default function AccountSettingsScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<Partial<UserData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const contentOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserData();

    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/user/status");
      setUserData(response.data);
      setEditableData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load account information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editableData.firstName || !editableData.lastName) {
      Alert.alert("Error", "First name and last name are required");
      return;
    }

    setIsSaving(true);
    try {
      await api.put("/api/user/update", {
        firstName: editableData.firstName,
        lastName: editableData.lastName,
      });

      setUserData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          firstName: editableData.firstName || prev.firstName,
          lastName: editableData.lastName || prev.lastName,
        };
      });

      setIsEditing(false);
      Alert.alert("Success", "Account information updated successfully");
    } catch (error) {
      console.error("Error updating user data:", error);
      Alert.alert("Error", "Failed to update account information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("jwt");
      await AsyncStorage.removeItem("refreshToken");
      router.replace("/account?form=login");
      Alert.alert("Signed Out", "You have been signed out successfully.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openPolicy = async (policyType: "terms" | "privacy") => {
    const url =
      policyType === "terms"
        ? "https://ingredigo.net/terms-of-service"
        : "https://ingredigo.net/privacy-policy";

    try {
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Cannot Open Link",
          `Unable to open ${
            policyType === "terms" ? "Terms of Use" : "Privacy Policy"
          }. Please visit ingredigo.net directly.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error(`Error opening ${policyType} policy:`, error);
      Alert.alert("Error", "There was a problem opening the page");
    }
  };

  const formatInfoRow = (
    label: string,
    value: string,
    editable: boolean = false,
    field?: keyof UserData
  ) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <Text
        className="text-base"
        style={{
          color: theme.primaryText,
          fontFamily: "Montserrat_500Medium",
        }}>
        {label}
      </Text>
      {isEditing && editable && field ? (
        <TextInput
          className="flex-1 py-1 px-3 ml-4 rounded"
          style={{
            backgroundColor: theme.input.backgroundColor,
            color: theme.primaryText,
            borderWidth: 1,
            borderColor: theme.input.borderColor,
            fontFamily: "Montserrat_400Regular",
          }}
          value={editableData[field] as string}
          onChangeText={(text) =>
            setEditableData({ ...editableData, [field]: text })
          }
          placeholder={label}
        />
      ) : (
        <Text
          className="text-base"
          style={{
            color: theme.secondaryText,
            fontFamily: "Montserrat_400Regular",
          }}>
          {value}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background }}
      className="flex-1">
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Account Settings",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: "#8BDBC1",
          headerTitleStyle: {
            fontFamily: "Montserrat_700Bold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-2">
              <Icon name="arrow-back" size={24} color="#8BDBC1" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1">
        <ScrollView className="flex-1">
          <Animated.View
            className="px-6 pt-6 pb-8"
            style={{
              opacity: headerOpacity,
              backgroundColor: theme.headerBackground,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}>
            <View className="items-center mb-4">
              <View
                className="h-24 w-24 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: theme.primary }}>
                <Text className="text-3xl font-bold" style={{ color: "#fff" }}>
                  {userData?.firstName?.[0]?.toUpperCase() ||
                    userData?.username?.[0]?.toUpperCase() ||
                    "?"}
                </Text>
              </View>
              <Text
                className="text-xl"
                style={{
                  color: "#8BDBC1",
                  fontFamily: "Montserrat_700Bold",
                }}>
                {userData?.username || ""}
              </Text>
              {userData?.subscriptionStatus && (
                <View className="bg-[#26A875] px-4 py-1 rounded-full mt-2">
                  <Text
                    className="text-white font-medium"
                    style={{ fontFamily: "Montserrat_500Medium" }}>
                    {userData.subscriptionStatus}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Content Section */}
          <Animated.View
            className="px-6 pt-4"
            style={{ opacity: contentOpacity }}>
            {isLoading ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#26A875" />
              </View>
            ) : (
              <View>
                <View className="bg-white dark:bg-[#2C2F33] rounded-xl p-4 shadow-sm mb-6">
                  <Text
                    className="text-lg mb-2"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Personal Information
                  </Text>
                  {formatInfoRow(
                    "First Name",
                    userData?.firstName || "",
                    true,
                    "firstName"
                  )}
                  {formatInfoRow(
                    "Last Name",
                    userData?.lastName || "",
                    true,
                    "lastName"
                  )}
                  {formatInfoRow("Email", userData?.email || "")}
                  {formatInfoRow("Username", userData?.username || "")}

                  <View className="flex-row justify-end mt-4">
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          className="px-4 py-2 rounded-md mr-3"
                          style={{
                            backgroundColor: "#e0e0e0",
                            opacity: isSaving ? 0.7 : 1,
                          }}
                          onPress={() => {
                            setIsEditing(false);
                            // Reset editable data
                            setEditableData({
                              firstName: userData?.firstName,
                              lastName: userData?.lastName,
                            });
                          }}
                          disabled={isSaving}>
                          <Text
                            className="font-medium"
                            style={{ color: "#333" }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="px-4 py-2 rounded-md"
                          style={{
                            backgroundColor: "#26A875",
                            opacity: isSaving ? 0.7 : 1,
                          }}
                          onPress={handleSave}
                          disabled={isSaving}>
                          {isSaving ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Text
                              className="font-medium text-white"
                              style={{ fontFamily: "Montserrat_500Medium" }}>
                              Save
                            </Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        className="px-4 py-2 rounded-md"
                        style={{ backgroundColor: theme.input.backgroundColor }}
                        onPress={() => setIsEditing(true)}>
                        <Text
                          className="font-medium"
                          style={{
                            color: theme.primary,
                            fontFamily: "Montserrat_500Medium",
                          }}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {userData?.subscriptionStatus && (
                  <View className="bg-white dark:bg-[#2C2F33] rounded-xl p-4 shadow-sm mb-6">
                    <Text
                      className="text-lg mb-2"
                      style={{
                        color: theme.primaryText,
                        fontFamily: "Montserrat_600SemiBold",
                      }}>
                      Subscription
                    </Text>
                    {formatInfoRow("Status", userData.subscriptionStatus)}
                    {userData.subscriptionEndDate &&
                      formatInfoRow(
                        "Renews On",
                        new Date(
                          userData.subscriptionEndDate
                        ).toLocaleDateString()
                      )}

                    <TouchableOpacity
                      className="bg-[#26A875] py-2 px-4 rounded-md mt-3 self-end"
                      onPress={() => router.push("/subscription-settings")}>
                      <Text
                        className="text-white font-medium"
                        style={{ fontFamily: "Montserrat_500Medium" }}>
                        Manage Subscription
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* New Policy Section */}
                <View className="bg-white dark:bg-[#2C2F33] rounded-xl p-4 shadow-sm mb-6">
                  <Text
                    className="text-lg mb-2"
                    style={{
                      color: theme.primaryText,
                      fontFamily: "Montserrat_600SemiBold",
                    }}>
                    Legal & Policies
                  </Text>

                  <TouchableOpacity
                    className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
                    onPress={() => openPolicy("terms")}>
                    <Text
                      className="text-base"
                      style={{
                        color: theme.primaryText,
                        fontFamily: "Montserrat_500Medium",
                      }}>
                      Terms of Use
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={24}
                      color={theme.secondaryText}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
                    onPress={() => openPolicy("privacy")}>
                    <Text
                      className="text-base"
                      style={{
                        color: theme.primaryText,
                        fontFamily: "Montserrat_500Medium",
                      }}>
                      Privacy Policy
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={24}
                      color={theme.secondaryText}
                    />
                  </TouchableOpacity>

                  <Text
                    className="text-sm mt-3"
                    style={{
                      color: theme.secondaryText,
                      fontFamily: "Montserrat_400Regular",
                    }}>
                    By using this app, you agree to our Terms of Use and
                    acknowledge our Privacy Policy.
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-[#f8f8f8] dark:bg-[#222] py-3 px-4 rounded-xl mb-6 flex-row items-center justify-center"
                  onPress={handleSignOut}>
                  <Icon
                    name="logout"
                    size={20}
                    color={colorScheme === "dark" ? "#ff6b6b" : "#e53935"}
                  />
                  <Text
                    className="ml-2 font-medium"
                    style={{
                      color: colorScheme === "dark" ? "#ff6b6b" : "#e53935",
                      fontFamily: "Montserrat_500Medium",
                    }}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
