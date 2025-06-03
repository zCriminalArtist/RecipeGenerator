import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Share,
  Alert,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { darkTheme, lightTheme } from "@/constants/Colors";
import api from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";

interface Ingredient {
  id: number;
  name: string;
  category: string;
}

interface RecipeIngredient {
  id: number;
  ingredient: Ingredient;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  description: string;
  recipeIngredients: RecipeIngredient[];
  favorite: boolean;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const recipeId = typeof id === "string" ? parseInt(id) : 0;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState("");
  const [editedIngredients, setEditedIngredients] = useState<{
    [key: number]: { quantity: string; unit: string };
  }>({});

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    fetchRecipe();
    loadFavoriteStatus();
    loadNotes();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Recipe>(`/recipes/${recipeId}`);
      setRecipe(response.data);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setError("Failed to load recipe details");
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favoriteRecipes");
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        setIsFavorite(favorites[recipeId] || false);
      }
    } catch (error) {
      console.error("Error loading favorite status:", error);
    }
  };

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(
        `recipe_notes_${recipeId}`
      );
      if (storedNotes) {
        setNotes(storedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const saveNotes = async (text: string) => {
    try {
      await AsyncStorage.setItem(`recipe_notes_${recipeId}`, text);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      const storedFavorites = await AsyncStorage.getItem("favoriteRecipes");
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};
      favorites[recipeId] = newFavoriteStatus;
      await AsyncStorage.setItem("favoriteRecipes", JSON.stringify(favorites));

      await api.post(`/recipes/${recipeId}/favorite`);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(!isFavorite);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const handleDeleteRecipe = async () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/recipes/${recipeId}`);
              router.back();
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert("Error", "Failed to delete recipe");
            }
          },
        },
      ]
    );
  };

  const handleUpdate = async (recipeIngredientId: number) => {
    try {
      const { quantity, unit } = editedIngredients[recipeIngredientId] ?? {};
      await api.put(`/recipeIngredients/${recipeIngredientId}`, {
        quantity,
        unit,
      });
    } catch (error) {
      Alert.alert("Error", "Error updating recipe ingredient");
    }
  };

  const renderInstructions = (instructions: string) => {
    const steps = instructions
      .split(/(?:\d+\.\s|\n)/)
      .filter((step) => step.trim() !== "");
    return steps.map((step, index) => (
      <View key={index} className="flex-row items-start mb-3">
        <Text
          className="font-bold mr-2 text-base"
          style={{ color: theme.primaryText }}>{`${index + 1}.`}</Text>
        <Text
          className="flex-1 text-base"
          style={{ color: theme.primaryText, lineHeight: 24 }}>
          {step}
        </Text>
      </View>
    ));
  };

  const RecipeHeaderSkeleton = () => (
    <ContentLoader
      speed={2}
      width="100%"
      height={120}
      backgroundColor={colorScheme === "dark" ? "#333" : "#f3f3f3"}
      foregroundColor={colorScheme === "dark" ? "#444" : "#ecebeb"}>
      <Rect x="0" y="0" rx="4" ry="4" width="70%" height="32" />
      <Rect x="0" y="45" rx="3" ry="3" width="100%" height="16" />
      <Rect x="0" y="70" rx="3" ry="3" width="90%" height="16" />
      <Rect x="0" y="95" rx="3" ry="3" width="80%" height="16" />
    </ContentLoader>
  );

  const SectionHeaderSkeleton = () => (
    <ContentLoader
      speed={2}
      width="100%"
      height={40}
      backgroundColor={colorScheme === "dark" ? "#333" : "#f3f3f3"}
      foregroundColor={colorScheme === "dark" ? "#444" : "#ecebeb"}>
      <Circle cx="12" cy="20" r="10" />
      <Rect x="30" y="10" rx="4" ry="4" width="40%" height="20" />
    </ContentLoader>
  );

  const IngredientSkeleton = () => (
    <View className="mb-6">
      <SectionHeaderSkeleton />
      <View className="mt-2">
        {[...Array(5)].map((_, index) => (
          <ContentLoader
            key={index}
            speed={2}
            width="100%"
            height={50}
            backgroundColor={colorScheme === "dark" ? "#333" : "#f3f3f3"}
            foregroundColor={colorScheme === "dark" ? "#444" : "#ecebeb"}>
            <Circle cx="10" cy="25" r="4" />
            <Rect x="24" y="15" rx="3" ry="3" width="55%" height="20" />
            <Rect x="80%" y="15" rx="3" ry="3" width="20%" height="20" />
          </ContentLoader>
        ))}
      </View>
    </View>
  );

  const InstructionsSkeleton = () => (
    <View className="mb-6">
      <SectionHeaderSkeleton />
      <View className="mt-2">
        {[...Array(3)].map((_, index) => (
          <ContentLoader
            key={index}
            speed={2}
            width="100%"
            height={80}
            backgroundColor={colorScheme === "dark" ? "#333" : "#f3f3f3"}
            foregroundColor={colorScheme === "dark" ? "#444" : "#ecebeb"}>
            <Rect x="0" y="15" rx="3" ry="3" width="20" height="20" />
            <Rect x="30" y="15" rx="3" ry="3" width="90%" height="16" />
            <Rect x="30" y="40" rx="3" ry="3" width="80%" height="16" />
            <Rect x="30" y="65" rx="3" ry="3" width="60%" height="16" />
          </ContentLoader>
        ))}
      </View>
    </View>
  );

  const NotesSkeleton = () => (
    <View className="mb-6">
      <SectionHeaderSkeleton />
      <ContentLoader
        speed={2}
        width="100%"
        height={120}
        backgroundColor={colorScheme === "dark" ? "#333" : "#f3f3f3"}
        foregroundColor={colorScheme === "dark" ? "#444" : "#ecebeb"}>
        <Rect x="0" y="10" rx="5" ry="5" width="100%" height="110" />
      </ContentLoader>
    </View>
  );

  const ActionButtonsSkeleton = () => (
    <ContentLoader
      speed={2}
      width="100%"
      height={60}
      backgroundColor={colorScheme === "dark" ? "#333" : "#f3f3f3"}
      foregroundColor={colorScheme === "dark" ? "#444" : "#ecebeb"}>
      <Circle cx="15%" cy="30" r="20" />
      <Circle cx="50%" cy="30" r="20" />
      <Circle cx="85%" cy="30" r="20" />
    </ContentLoader>
  );

  // Error UI component
  const ErrorView = () => (
    <View
      className="flex-1 justify-center items-center px-6"
      style={{ backgroundColor: theme.background }}>
      <Icon
        name="error-outline"
        size={70}
        color={theme.secondaryText}
        style={{ marginBottom: 20 }}
      />
      <Text
        style={{
          color: theme.primaryText,
          fontFamily: "Montserrat_600SemiBold",
          textAlign: "center",
          fontSize: 18,
          marginBottom: 12,
        }}>
        Oops! Something went wrong
      </Text>
      <Text
        style={{
          color: theme.secondaryText,
          fontFamily: "Montserrat_400Regular",
          textAlign: "center",
          marginBottom: 30,
        }}>
        We couldn't load this recipe. Please try again.
      </Text>
      <View className="flex-row space-x-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="py-3 px-6 rounded-full bg-gray-200 dark:bg-gray-700">
          <Text
            style={{
              color: theme.primaryText,
              fontFamily: "Montserrat_500Medium",
            }}>
            Go Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={fetchRecipe}
          className="py-3 px-6 rounded-full bg-[#26A875]">
          <Text
            style={{
              color: "white",
              fontFamily: "Montserrat_500Medium",
            }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Skeleton loading view
  const LoadingView = () => (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <Stack.Screen
        options={{
          title: "Loading Recipe...",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: "#8BDBC1",
          headerTitleStyle: {
            fontFamily: "Montserrat_600SemiBold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-2">
              <Icon name="arrow-back" size={24} color="#8BDBC1" />
            </TouchableOpacity>
          ),
        }}
      />

      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "light-content"}
      />

      <ScrollView className="flex-1 px-5 pt-4">
        <RecipeHeaderSkeleton />
        <IngredientSkeleton />
        <InstructionsSkeleton />
        <NotesSkeleton />
        <ActionButtonsSkeleton />
      </ScrollView>
    </View>
  );

  if (loading) {
    return <LoadingView />;
  }

  if (error || !recipe) {
    return <ErrorView />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: recipe.name,
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

      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "light-content"}
      />

      <ScrollView className="flex-1 px-5 pt-4">
        <Text
          className="text-2xl mb-4"
          style={{
            color: theme.primaryText,
            fontFamily: "Montserrat_700Bold",
          }}>
          {recipe.name}
        </Text>

        <Text
          className="mb-6 text-base"
          style={{
            color: theme.primaryText,
            fontFamily: "Montserrat_400Regular",
            lineHeight: 24,
          }}>
          {recipe.description}
        </Text>

        {/* Ingredients Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Icon name="restaurant" size={22} color={theme.primary} />
            <Text
              style={{
                color: theme.primaryText,
                fontFamily: "Montserrat_600SemiBold",
              }}
              className="text-lg font-semibold ml-2">
              Ingredients
            </Text>
          </View>

          <View className="p-2">
            {recipe.recipeIngredients.map((recipeIngredient, index) => (
              <View
                key={recipeIngredient.id}
                className={`flex-row items-center py-3 ${
                  index < recipe.recipeIngredients.length - 1
                    ? "border-b border-gray-200 dark:border-gray-700"
                    : ""
                }`}>
                <View className="w-2 h-2 rounded-full bg-[#26A875] mr-3" />
                <Text
                  className="flex-1 text-base"
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_500Medium",
                  }}>
                  {recipeIngredient.ingredient.name.replace(
                    /\b\w+/g,
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )}
                </Text>

                <View className="flex-row items-center">
                  <TextInput
                    className="ml-2 px-3 py-1 rounded-l-md text-center min-w-[50px]"
                    style={{
                      color: theme.primaryText,
                      backgroundColor:
                        colorScheme === "dark" ? "#3A3F44" : "#FFFFFF",
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 14,
                    }}
                    placeholder="Qty"
                    value={
                      editedIngredients[recipeIngredient.id]?.quantity !==
                      undefined
                        ? editedIngredients[recipeIngredient.id].quantity
                        : recipeIngredient.quantity
                    }
                    onChangeText={(text) =>
                      setEditedIngredients((prev) => ({
                        ...prev,
                        [recipeIngredient.id]: {
                          quantity: text,
                          unit:
                            prev[recipeIngredient.id]?.unit !== undefined
                              ? prev[recipeIngredient.id].unit
                              : recipeIngredient.unit,
                        },
                      }))
                    }
                    onEndEditing={() => {
                      const editedValue =
                        editedIngredients[recipeIngredient.id]?.quantity;
                      if (editedValue !== undefined && editedValue !== "") {
                        handleUpdate(recipeIngredient.id);
                      } else if (editedValue === "") {
                        setEditedIngredients((prev) => ({
                          ...prev,
                          [recipeIngredient.id]: {
                            ...prev[recipeIngredient.id],
                            quantity: recipeIngredient.quantity,
                          },
                        }));
                      }
                    }}
                  />
                  <TextInput
                    className="px-3 py-1 rounded-r-md text-center min-w-[40px]"
                    style={{
                      color: theme.primaryText,
                      backgroundColor:
                        colorScheme === "dark" ? "#3A3F44" : "#FFFFFF",
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 14,
                      borderLeftWidth: 1,
                      borderLeftColor:
                        colorScheme === "dark" ? "#2C2F33" : "#D1D5DB",
                    }}
                    placeholder="Unit"
                    value={
                      editedIngredients[recipeIngredient.id]?.unit !== undefined
                        ? editedIngredients[recipeIngredient.id].unit
                        : recipeIngredient.unit
                    }
                    onChangeText={(text) =>
                      setEditedIngredients((prev) => ({
                        ...prev,
                        [recipeIngredient.id]: {
                          quantity:
                            prev[recipeIngredient.id]?.quantity !== undefined
                              ? prev[recipeIngredient.id].quantity
                              : recipeIngredient.quantity,
                          unit: text,
                        },
                      }))
                    }
                    onEndEditing={() => {
                      const editedValue =
                        editedIngredients[recipeIngredient.id]?.unit;
                      if (editedValue !== undefined && editedValue !== "") {
                        handleUpdate(recipeIngredient.id);
                      } else if (editedValue === "") {
                        setEditedIngredients((prev) => ({
                          ...prev,
                          [recipeIngredient.id]: {
                            ...prev[recipeIngredient.id],
                            unit: recipeIngredient.unit,
                          },
                        }));
                      }
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Icon name="menu-book" size={22} color={theme.primary} />
            <Text
              style={{
                color: theme.primaryText,
                fontFamily: "Montserrat_600SemiBold",
              }}
              className="text-lg font-semibold ml-2">
              Instructions
            </Text>
          </View>

          <View className="p-2 mb-4">
            {renderInstructions(recipe.instructions)}
          </View>
        </View>

        {/* Notes Section */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <Icon name="edit-note" size={22} color={theme.primary} />
            <Text
              style={{
                color: theme.primaryText,
                fontFamily: "Montserrat_600SemiBold",
              }}
              className="text-lg font-semibold ml-2">
              Personal Notes
            </Text>
          </View>

          <TextInput
            style={{
              backgroundColor: colorScheme === "dark" ? "#2C2F33" : "#F5F7FA",
              color: theme.primaryText,
              padding: 16,
              borderRadius: 8,
              minHeight: 120,
              textAlignVertical: "top",
              fontFamily: "Montserrat_400Regular",
              fontSize: 15,
              lineHeight: 24,
            }}
            multiline={true}
            placeholder="Add your personal notes about this recipe..."
            placeholderTextColor={theme.secondaryText}
            value={notes}
            onChangeText={(text) => {
              setNotes(text);
              saveNotes(text);
            }}
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mb-10">
          <TouchableOpacity
            onPress={() => {
              const recipeText = `Recipe: ${recipe.name}\n\nDescription: ${recipe.description}\n\nInstructions:\n${recipe.instructions}`;
              Share.share({ message: recipeText });
            }}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <Icon name="share" size={24} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteRecipe}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <Icon name="delete" size={24} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <Icon
              name={isFavorite ? "favorite" : "favorite-border"}
              size={24}
              color={isFavorite ? "#FF6B6B" : theme.secondaryText}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
