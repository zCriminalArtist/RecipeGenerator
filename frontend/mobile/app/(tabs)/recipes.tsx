import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  Share,
  Animated,
  Easing,
  StatusBar,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from "react-native";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import api from "@/utils/api";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ContentLoader, { Rect } from "react-content-loader/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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

export default function RecipeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editedIngredients, setEditedIngredients] = useState<{
    [key: number]: { quantity: string; unit: string };
  }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [expandedRecipes, setExpandedRecipes] = useState<{
    [key: number]: boolean;
  }>({});

  const [favoriteRecipes, setFavoriteRecipes] = useState<{
    [key: number]: boolean;
  }>({});

  const [sortOption, setSortOption] = useState<"recent" | "name">("recent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showSortModal, setShowSortModal] = useState(false);

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const [animatedItems, setAnimatedItems] = useState<
    {
      opacity: Animated.Value;
      height: Animated.Value;
      expanded: Animated.Value;
    }[]
  >([]);

  const headerHeight = useRef(new Animated.Value(140)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const searchBarY = useRef(new Animated.Value(-25)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerShadowOpacity = useRef(new Animated.Value(0)).current;

  const headerShadow = headerShadowOpacity.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 0.5],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, -60],
    extrapolate: "clamp",
  });

  useEffect(() => {}, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();

      return () => {};
    }, [])
  );

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, recipes, sortOption, sortDirection]);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Recipe[]>("/recipes");

      const animatedValues = response.data.map(() => ({
        opacity: new Animated.Value(0),
        height: new Animated.Value(0.5),
        expanded: new Animated.Value(0), // 0 = collapsed, 1 = expanded
      }));

      setAnimatedItems(animatedValues);
      setRecipes(response.data);

      setExpandedRecipes({});

      setTimeout(() => {
        triggerTrickleAnimation(animatedValues);
      }, 100);
    } catch (error) {
      Alert.alert("Error", "Error fetching recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        headerShadowOpacity.setValue(offsetY);
      },
    }
  );

  const triggerTrickleAnimation = (items: typeof animatedItems) => {
    const animations = items.map((item, index) => {
      const delay = index * 200;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(item.opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.timing(item.height, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        ]),
      ]);
    });
    Animated.stagger(300, animations).start();
  };

  const toggleRecipeExpansion = (recipeId: number, index: number) => {
    const newExpandedState = !expandedRecipes[recipeId];

    setExpandedRecipes({
      ...expandedRecipes,
      [recipeId]: newExpandedState,
    });

    Animated.timing(animatedItems[index].expanded, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }).start();
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favoriteRecipes");
      if (storedFavorites) {
        setFavoriteRecipes(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const saveFavorites = async (favorites: { [key: number]: boolean }) => {
    try {
      await AsyncStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const toggleFavorite = async (recipeId: number) => {
    try {
      const newFavorites = {
        ...favoriteRecipes,
        [recipeId]: !favoriteRecipes[recipeId],
      };
      setFavoriteRecipes(newFavorites);
      await api.post(`/recipes/${recipeId}/favorite`);
      saveFavorites(newFavorites);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavoriteRecipes({ ...favoriteRecipes });
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const sortRecipes = (recipesToSort: Recipe[]) => {
    let sorted;

    if (sortOption === "name") {
      sorted = [...recipesToSort].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    } else {
      sorted = [...recipesToSort].sort((a, b) => b.id - a.id);
    }

    if (
      (sortOption === "recent" && sortDirection === "asc") ||
      (sortOption === "name" && sortDirection === "desc")
    ) {
      return sorted.reverse();
    }

    return sorted;
  };

  const filterRecipes = () => {
    let filtered;

    if (
      searchQuery.toLowerCase() === "favorites" ||
      searchQuery.toLowerCase() === "favorite"
    ) {
      filtered = recipes.filter((recipe) => recipe.favorite);
    } else {
      filtered = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const sorted = sortRecipes(filtered);
    setFilteredRecipes(sorted);
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      await api.delete(`/recipes/${recipeId}`);
      fetchRecipes();
    } catch (error) {
      Alert.alert("Error", "Error deleting recipe");
    }
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
      <View key={index} className="flex-row items-start mb-1">
        <Text
          className="font-bold mr-1 text-sm"
          style={{ color: theme.primaryText }}>{`${index + 1}.`}</Text>
        <Text className="flex-1 text-sm" style={{ color: theme.primaryText }}>
          {step}
        </Text>
      </View>
    ));
  };

  const renderRecipe = ({ item, index }: { item: Recipe; index: number }) => {
    const isExpanded = expandedRecipes[item.id] || false;
    const isFavorite = favoriteRecipes[item.id] || false;

    const animatedItem = animatedItems[index] || {
      opacity: new Animated.Value(1),
      height: new Animated.Value(1),
      expanded: new Animated.Value(0),
    };

    const instructionsSteps = item.instructions
      .split(/(?:\d+\.\s|\n)/)
      .filter((step) => step.trim() !== "");
    const estimatedInstructionsHeight = instructionsSteps.length * 40;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/recipe/${item.id}`)}>
        <Animated.View
          className="p-4 mx-6 my-3 rounded-md"
          style={{
            backgroundColor: theme.input.backgroundColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            opacity: animatedItem.opacity || 1,
            transform: [
              {
                scale:
                  animatedItem.opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }) || 1,
              },
            ],
          }}>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation
                toggleRecipeExpansion(item.id, index);
              }}
              className="flex-1 flex-row items-center">
              <Animated.Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_700Bold",
                }}
                className="text-lg font-bold mb-1 flex-1">
                {item.name}
              </Animated.Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation(); // Prevent navigation
                  toggleRecipeExpansion(item.id, index);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: animatedItem.expanded.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  }}>
                  <Icon
                    name="expand-more"
                    size={28}
                    color={theme.secondaryText}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          <Animated.Text
            style={{
              color: theme.primaryText,
              opacity:
                animatedItem.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }) || 1,
            }}
            className="mb-5">
            {item.description}
          </Animated.Text>

          {/* Ingredients Section */}
          <Animated.View
            style={{
              opacity:
                animatedItem.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }) || 1,
            }}
            className="mb-2">
            <View className="flex-row items-center">
              <Icon name="restaurant" size={18} color={theme.primary} />
              <Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_600SemiBold",
                }}
                className="font-semibold ml-2">
                Ingredients
              </Text>
            </View>
          </Animated.View>

          <View className="relative mb-6">
            <Animated.View
              style={{
                height: animatedItem.expanded.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, item.recipeIngredients.length * 40 + 20],
                }),
                overflow: "hidden",
                opacity:
                  animatedItem.opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }) || 1,
              }}
              className="p-2">
              {item.recipeIngredients.map(
                (recipeIngredient, ingredientIndex) => (
                  <View
                    key={recipeIngredient.id}
                    className={`flex-row items-center py-2 ${
                      ingredientIndex < item.recipeIngredients.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}>
                    <View className="w-1.5 h-1.5 rounded-full bg-[#26A875] mr-2" />
                    <Text
                      className="flex-1 text-sm"
                      style={{
                        color: theme.primaryText,
                        fontFamily: "Montserrat_500Medium",
                      }}>
                      {recipeIngredient.ingredient.name.replace(
                        /\b\w+/g,
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )}
                    </Text>

                    <View className="flex-row items-center">
                      <TextInput
                        className="ml-2 px-3 py-1 rounded-l-md text-center min-w-[50px]"
                        style={{
                          color: theme.primaryText,
                          backgroundColor:
                            colorScheme === "dark" ? "#3A3F44" : "#E8ECF4",
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
                            colorScheme === "dark" ? "#3A3F44" : "#E8ECF4",
                          fontFamily: "Montserrat_400Regular",
                          fontSize: 14,
                          borderLeftWidth: 1,
                          borderLeftColor:
                            colorScheme === "dark" ? "#2C2F33" : "#D1D5DB",
                        }}
                        placeholder="Unit"
                        value={
                          editedIngredients[recipeIngredient.id]?.unit !==
                          undefined
                            ? editedIngredients[recipeIngredient.id].unit
                            : recipeIngredient.unit
                        }
                        onChangeText={(text) =>
                          setEditedIngredients((prev) => ({
                            ...prev,
                            [recipeIngredient.id]: {
                              quantity:
                                prev[recipeIngredient.id]?.quantity !==
                                undefined
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
                )
              )}
            </Animated.View>

            <TouchableOpacity
              activeOpacity={1.0}
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation
                toggleRecipeExpansion(item.id, index);
              }}
              disabled={isExpanded}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 20,
              }}>
              <Animated.View
                style={{
                  opacity: animatedItem.expanded.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [1, 0, 0],
                  }),
                  height: "100%",
                  width: "100%",
                }}>
                <LinearGradient
                  colors={[
                    colorScheme === "dark"
                      ? "rgba(44, 47, 51, 0)"
                      : "rgba(255, 255, 255, 0)",
                    colorScheme === "dark"
                      ? "rgba(44, 47, 51, 0.9)"
                      : "rgba(255, 255, 255, 0.9)",
                    colorScheme === "dark"
                      ? "rgba(44, 47, 51, 1)"
                      : "rgba(255, 255, 255, 1)",
                  ]}
                  style={{ height: 40 }}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Instructions Section */}
          <Animated.View
            style={{
              opacity:
                animatedItem.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }) || 1,
              marginTop: animatedItem.expanded.interpolate({
                inputRange: [0, 1],
                outputRange: [3, 5],
              }),
            }}
            className="mb-2">
            <View className="flex-row items-center">
              <Icon name="menu-book" size={18} color={theme.primary} />
              <Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_600SemiBold",
                }}
                className="font-semibold ml-2">
                Instructions
              </Text>
            </View>
          </Animated.View>

          <View className="relative mb-4">
            <Animated.View
              style={{
                height: animatedItem.expanded.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, estimatedInstructionsHeight + 20],
                }),
                overflow: "hidden",
                opacity:
                  animatedItem.opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }) || 1,
              }}
              className="p-3">
              {renderInstructions(item.instructions)}
            </Animated.View>

            <TouchableOpacity
              activeOpacity={1.0}
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation
                toggleRecipeExpansion(item.id, index);
              }}
              disabled={isExpanded}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
              }}>
              <Animated.View
                style={{
                  opacity: animatedItem.expanded.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [1, 0, 0],
                  }),
                  height: "100%",
                  width: "100%",
                }}>
                <LinearGradient
                  colors={[
                    colorScheme === "dark"
                      ? "rgba(44, 47, 51, 0)"
                      : "rgba(255, 255, 255, 0)",
                    colorScheme === "dark"
                      ? "rgba(44, 47, 51, 0.9)"
                      : "rgba(255, 255, 255, 0.9)",
                    colorScheme === "dark"
                      ? "rgba(44, 47, 51, 1)"
                      : "rgba(255, 255, 255, 1)",
                  ]}
                  style={{ height: 60 }}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Action buttons - rearranged order */}
          <View className="flex-row justify-between items-center mt-4 px-2">
            {/* Share button - left */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation
                const recipeText = `Recipe: ${item.name}\n\nDescription: ${item.description}\n\nInstructions:\n${item.instructions}`;
                Share.share({ message: recipeText });
              }}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="share" size={24} color={theme.secondaryText} />
            </TouchableOpacity>

            {/* Heart/favorite icon - middle */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation
                toggleFavorite(item.id);
              }}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: isFavorite ? 1.1 : 1,
                    },
                  ],
                }}>
                <Icon
                  name={isFavorite ? "favorite" : "favorite-border"}
                  size={26}
                  color={isFavorite ? "#FF6B6B" : theme.secondaryText}
                />
              </Animated.View>
            </TouchableOpacity>

            {/* Delete/trash icon - right */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent navigation
                handleDeleteRecipe(item.id);
              }}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="delete" size={24} color={theme.secondaryText} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const SortModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showSortModal}
      onRequestClose={() => setShowSortModal(false)}>
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}>
        <View
          style={{
            backgroundColor: theme.input.backgroundColor,
            borderRadius: 12,
            padding: 20,
            width: "80%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <Text
            style={{
              color: theme.primaryText,
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 18,
              marginBottom: 16,
              textAlign: "center",
            }}>
            Sort Recipes By
          </Text>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.divider,
              paddingBottom: 10,
              marginBottom: 10,
            }}>
            <Text
              style={{
                color: theme.primaryText,
                fontFamily: "Montserrat_500Medium",
                fontSize: 16,
                marginBottom: 8,
              }}>
              Date Added
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 8,
                backgroundColor:
                  sortOption === "recent" && sortDirection === "desc"
                    ? `${theme.primary}20`
                    : "transparent",
                borderRadius: 8,
              }}
              onPress={() => {
                setSortOption("recent");
                setSortDirection("desc");
                setShowSortModal(false);
                filterRecipes();
              }}>
              <Icon
                name="arrow-downward"
                size={18}
                color={
                  sortOption === "recent" && sortDirection === "desc"
                    ? theme.primary
                    : theme.secondaryText
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 15,
                }}>
                Newest First
              </Text>
              {sortOption === "recent" && sortDirection === "desc" && (
                <Icon
                  name="check"
                  size={20}
                  color={theme.primary}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 8,
                backgroundColor:
                  sortOption === "recent" && sortDirection === "asc"
                    ? `${theme.primary}20`
                    : "transparent",
                borderRadius: 8,
              }}
              onPress={() => {
                setSortOption("recent");
                setSortDirection("asc");
                setShowSortModal(false);
                filterRecipes();
              }}>
              <Icon
                name="arrow-upward"
                size={18}
                color={
                  sortOption === "recent" && sortDirection === "asc"
                    ? theme.primary
                    : theme.secondaryText
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 15,
                }}>
                Oldest First
              </Text>
              {sortOption === "recent" && sortDirection === "asc" && (
                <Icon
                  name="check"
                  size={20}
                  color={theme.primary}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                color: theme.primaryText,
                fontFamily: "Montserrat_500Medium",
                fontSize: 16,
                marginBottom: 8,
              }}>
              Alphabetical
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 8,
                backgroundColor:
                  sortOption === "name" && sortDirection === "asc"
                    ? `${theme.primary}20`
                    : "transparent",
                borderRadius: 8,
              }}
              onPress={() => {
                setSortOption("name");
                setSortDirection("asc");
                setShowSortModal(false);
                filterRecipes();
              }}>
              <Icon
                name="arrow-upward"
                size={18}
                color={
                  sortOption === "name" && sortDirection === "asc"
                    ? theme.primary
                    : theme.secondaryText
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 15,
                }}>
                A to Z
              </Text>
              {sortOption === "name" && sortDirection === "asc" && (
                <Icon
                  name="check"
                  size={20}
                  color={theme.primary}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 8,
                backgroundColor:
                  sortOption === "name" && sortDirection === "desc"
                    ? `${theme.primary}20`
                    : "transparent",
                borderRadius: 8,
              }}
              onPress={() => {
                setSortOption("name");
                setSortDirection("desc");
                setShowSortModal(false);
                setTimeout(() => filterRecipes(), 0);
              }}>
              <Icon
                name="arrow-downward"
                size={18}
                color={
                  sortOption === "name" && sortDirection === "desc"
                    ? theme.primary
                    : theme.secondaryText
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme.primaryText,
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 15,
                }}>
                Z to A
              </Text>
              {sortOption === "name" && sortDirection === "desc" && (
                <Icon
                  name="check"
                  size={20}
                  color={theme.primary}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <SortModal />

      <Animated.View
        style={{
          height: 140,
          backgroundColor: theme.headerBackground,
          zIndex: 1,
          transform: [{ translateY: headerTranslateY }],
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: headerShadow,
          shadowRadius: 3,
          elevation: headerShadow.interpolate({
            inputRange: [0, 0.5],
            outputRange: [0, 4],
            extrapolate: "clamp",
          }),
        }}>
        <SafeAreaView>
          <StatusBar
            barStyle={
              colorScheme === "dark" ? "light-content" : "light-content"
            }
            backgroundColor={theme.primary}
          />
          <Animated.View
            className="flex-row justify-between items-center mx-7 mt-6"
            style={{ opacity: titleOpacity }}>
            <Text
              style={{ fontFamily: "Montserrat_700Bold" }}
              className="text-2xl font-bold text-[#8BDBC1]">
              Your Recipes
            </Text>
            <View className="flex-row">
              {/* Sort Button */}
              <TouchableOpacity
                onPress={() => setShowSortModal(true)}
                className="mr-4 mt-1">
                <View className="flex-row items-center">
                  <Icon
                    name={
                      sortOption === "name" ? "sort-by-alpha" : "access-time"
                    }
                    size={24}
                    color="#8BDBC1"
                  />
                  <Icon
                    name={
                      sortDirection === "asc"
                        ? "arrow-upward"
                        : "arrow-downward"
                    }
                    size={16}
                    color="#8BDBC1"
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Existing Refresh Button */}
              <TouchableOpacity
                onPress={() => fetchRecipes()}
                className="mt-0.5">
                <Icon name="refresh" size={28} color="#8BDBC1" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </Animated.View>

      <Animated.View
        style={{
          backgroundColor: theme.input.backgroundColor,
          borderWidth: 1,
          borderColor: isInputFocused ? `${theme.divider}40` : "transparent",
          marginTop: 115,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
          zIndex: 2,
          position: "absolute",
          left: 24,
          right: 24,
          transform: [{ translateY: searchBarTranslateY }],
        }}
        className="rounded-md flex-row items-center px-4 py-3 relative">
        <Icon name="search" size={24} color="#888" />
        <TextInput
          className="flex-1 pl-2 h-full"
          placeholder="Search recipes..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          style={{
            textAlignVertical: "center",
            color: theme.primaryText,
            fontSize: 16,
            fontFamily: "Montserrat_400Regular",
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              Keyboard.dismiss();
            }}>
            <Icon name="close" size={24} color="#888" />
          </TouchableOpacity>
        )}
      </Animated.View>

      <View className="flex-1 mt-[120px]">
        {isLoading ? (
          <View className="p-6 pt-20 w-full">
            <ContentLoader
              speed={1}
              width="100%"
              height={600}
              backgroundColor={theme.background}
              foregroundColor={theme.secondaryText}>
              <Rect x="0" y="0" rx="8" ry="8" width="100%" height="200" />
              <Rect x="0" y="220" rx="8" ry="8" width="100%" height="200" />
              <Rect x="0" y="440" rx="8" ry="8" width="100%" height="200" />
            </ContentLoader>
          </View>
        ) : (
          <Animated.FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecipe}
            contentContainerStyle={{
              paddingVertical: 16,
              paddingTop: 60,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16} // Ensures smooth scroll events
          />
        )}
      </View>
      <View className="h-[80px]" />
      {/* Extra space to push content above the bottom tab bar */}
    </View>
  );
}
