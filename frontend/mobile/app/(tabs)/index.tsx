import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Share,
  Animated,
  LayoutChangeEvent,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/api";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import { router, usePathname } from "expo-router";
import { jwtDecode } from "jwt-decode";
import ContentLoader, { Rect } from "react-content-loader/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import IngredientContainer from "@/components/ui/IngredientContainer";
import ProfileMenu from "@/components/ui/ProfileMenu";

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  description: string;
}

export default function HomeScreen() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string; brandOwner: string }[]
  >([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [username, setUsername] = useState<string>("Matthew");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const usda_api_key =
    process.env.EXPO_PUBLIC_USDA_API_KEY || "default_usda_api_key";
  const scrollViewRef = useRef<ScrollView>(null);
  const [ingredientContainerHeight, setIngredientContainerHeight] = useState(0);
  const headerHeight = useRef(new Animated.Value(180)).current; // Base header height
  const welcomeTextOpacity = useRef(new Animated.Value(1)).current; // For welcome text
  const suggestionsHeight = useRef(new Animated.Value(0)).current;
  const suggestionsOpacity = useRef(new Animated.Value(0)).current;
  const [animatedItems, setAnimatedItems] = useState<
    {
      opacity: Animated.Value;
      height: Animated.Value;
    }[]
  >([]);
  const emptyStateOpacity = useRef(new Animated.Value(0)).current;
  const currentPath = usePathname();

  // Track if we're on the recipes tab for animations
  const isRecipesTab = currentPath === "/(tabs)/recipes";

  const measureIngredientContainer = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setIngredientContainerHeight(height - 20);
  };

  useEffect(() => {
    const baseHeight = 180; // Base header height without ingredients
    const newHeaderHeight =
      baseHeight + (ingredients.length > 0 ? ingredientContainerHeight : 0);

    const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

    const animConfig = {
      duration: 300,
      easing: customEasing,
    };

    Animated.parallel([
      // Header height animation
      Animated.timing(headerHeight, {
        toValue: newHeaderHeight,
        ...animConfig,
        useNativeDriver: false, // Height can't use native driver
      }),
    ]).start();
  }, [ingredientContainerHeight, ingredients.length]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [ingredients]);

  useEffect(() => {
    const fetchUsername = async () => {
      const token = await AsyncStorage.getItem("jwt");
      if (token) {
        const decodedToken = jwtDecode(token);
        const username = (decodedToken as { username: string }).username;
        console.log("Username:", username);
        if (username) {
          setUsername(username);
        }
      }
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    if (suggestions.length > 0 && searchTerm) {
      // Animate to expanded state
      Animated.parallel([
        Animated.timing(suggestionsHeight, {
          toValue: 250, // Max height from your existing className
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }),
        Animated.timing(suggestionsOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate to collapsed state
      Animated.parallel([
        Animated.timing(suggestionsHeight, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }),
        Animated.timing(suggestionsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [suggestions.length, searchTerm]);

  useEffect(() => {
    // Should show empty state when no ingredients and no search term
    const shouldShowEmptyState = ingredients.length === 0 && !searchTerm;

    Animated.timing(emptyStateOpacity, {
      toValue: shouldShowEmptyState ? 1 : 0,
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [ingredients.length, searchTerm]);

  const fetchRecipe = async () => {
    setIsGenerating(true);
    setSearchTerm("");
    Keyboard.dismiss();
    try {
      const encodedIngredients = ingredients
        .map((ing) => encodeURIComponent(ing))
        .join(",");
      const response = await api.get<Recipe[]>(
        `/recipes?ingredients=${encodedIngredients}`
      );

      // Create animated values for each recipe item
      const animatedValues = response.data.map(() => ({
        opacity: new Animated.Value(0),
        height: new Animated.Value(0.5),
      }));

      setAnimatedItems(animatedValues);
      setRecipes(response.data);

      // Start trickle animation after a short delay
      setTimeout(() => {
        triggerTrickleAnimation(animatedValues);
      }, 100);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        const { customerId, paymentIntentClientSecret } = error.response.data;
        router.push({
          pathname: "/trial-ended",
          params: { id: customerId, paymentIntent: paymentIntentClientSecret },
        });
      } else {
        Alert.alert("Error", "Error fetching recipes");
        console.error(error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerTrickleAnimation = (items: typeof animatedItems) => {
    const animations = items.map((item, index) => {
      const delay = index * 700;

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

    Animated.stagger(1000, animations).start();
  };

  const deleteIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem("jwt");
    router.replace("/account");
  };

  const renderInstructions = (instructions: string) => {
    const steps = instructions
      .split(/(?:\d+\.\s|\n)/)
      .filter((step) => step.trim() !== "");
    return steps.map((step, index) => (
      <View key={index} className="flex-row items-start mb-1">
        <Text
          className={`font-bold mr-1 text-sm ${
            colorScheme === "dark" ? "text-white" : "text-black"
          }`}>{`${index + 1}.`}</Text>
        <Text
          className={`flex-1 text-sm ${
            colorScheme === "dark" ? "text-white" : "text-black"
          }`}>
          {step}
        </Text>
      </View>
    ));
  };

  const fetchIngredientSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await axios.post(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usda_api_key}`,
        {
          query,
          dataType: ["Foundation", "Branded"],
        }
      );
      const foods = result?.data?.foods ?? [];

      const foundationFoods = foods.filter(
        (food: any) => food.dataType === "Foundation"
      );
      const otherFoods = foods.filter(
        (food: any) => food.dataType !== "Foundation"
      );

      const remainingSlots = 10 - foundationFoods.length;
      const finalFoods = foundationFoods
        .slice(0, 10)
        .concat(otherFoods.slice(0, remainingSlots));

      const transformed = finalFoods
        .slice(0, 10)
        .map((food: any, index: number) => {
          const originalName = food.description.trim();
          const displayedName =
            originalName.charAt(0).toUpperCase() +
            originalName.slice(1).toLowerCase();
          return {
            id: index.toString(),
            name: displayedName,
            brandOwner: food.brandOwner || "",
          };
        });
      setSuggestions(transformed);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  return (
    <MenuProvider style={{ zIndex: 0 }}>
      <View style={{ backgroundColor: theme.background }} className="flex-1">
        <Animated.View
          style={{
            height: headerHeight,
            backgroundColor: theme.headerBackground,
            zIndex: 1,
          }}>
          <SafeAreaView>
            <StatusBar
              barStyle={
                colorScheme === "dark" ? "light-content" : "dark-content"
              }
              backgroundColor={theme.primary}
            />
            <View className="flex-row justify-between items-center mx-6 mt-6">
              <Animated.Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  opacity: welcomeTextOpacity,
                }}
                className="text-2xl font-bold text-[#8BDBC1] max-w-[90%]">
                Welcome back, {username}!{"\n"}
                Ready to cook?
              </Animated.Text>
              <ProfileMenu
                username={username}
                onSignOut={handleSignOut}
                onSubscription={() => router.push("/subscription")}
                theme={theme}
              />
            </View>
            <View onLayout={measureIngredientContainer}>
              <IngredientContainer
                ingredients={ingredients}
                deleteIngredient={deleteIngredient}
                theme={theme}
              />
            </View>
          </SafeAreaView>
        </Animated.View>
        <View
          style={{
            backgroundColor: theme.input.backgroundColor,
            borderWidth: 1,
            borderColor: isInputFocused ? `${theme.divider}40` : "transparent",
            marginTop: -25, // Move up to overlap the header
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 2, // Ensure it appears above the header
          }}
          className="rounded-md flex-row items-center px-4 py-3 mx-6 relative">
          <Icon name="search" size={24} color="#888" />
          <TextInput
            className="flex-1 pl-2 h-full"
            placeholder="Search for ingredients..."
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              fetchIngredientSuggestions(text);
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={{
              textAlignVertical: "center",
              color: theme.primaryText,
              fontSize: 16,
              fontFamily: "Montserrat_400Regular",
            }}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm("");
                setSuggestions([]);
                Keyboard.dismiss();
              }}>
              <Icon name="close" size={24} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-1">
          {/* Suggestions list - now positioned absolutely to overlap main content */}
          <Animated.View
            style={{
              position: "absolute",
              top: 15, // Position below the search input
              left: 24,
              right: 24,
              height: suggestionsHeight,
              opacity: suggestionsOpacity,
              overflow: "hidden",
              zIndex: 5, // Higher z-index to ensure it appears above content
              backgroundColor: theme.input.backgroundColor,
              borderWidth: 1,
              borderColor: `${theme.divider}40`,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 8,
            }}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              className="flex-grow-0"
              renderItem={({ item, index }) => {
                const lastItem = index === suggestions.length - 1;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setIngredients([...ingredients, item.name]);
                      setSuggestions([]);
                      setSearchTerm("");
                    }}
                    style={{
                      borderBottomWidth: lastItem ? 0 : 1,
                      borderBottomColor: `${theme.divider}40`,
                    }}>
                    <View>
                      <Text
                        style={{
                          color: theme.primaryText,
                        }}
                        className="m-5 mr-10">
                        {item.name}
                      </Text>
                      {item.brandOwner ? (
                        <Text className="ml-5 -mt-5 mb-4 text-gray-500">
                          {item.brandOwner}
                        </Text>
                      ) : null}
                      <View className="opacity-80 bg-transparent absolute right-[15px] h-full justify-center">
                        <Icon name="add-circle" size={25} color="gray" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>

          {/* Main content area - z-index adjusted to be below suggestions */}
          <View className="flex-1" style={{ zIndex: 1 }}>
            {isGenerating ? (
              <View className="p-6 w-full">
                <ContentLoader
                  speed={1}
                  width="100%"
                  height={500}
                  backgroundColor={theme.background}
                  foregroundColor={theme.input.backgroundColor}>
                  <Rect x="0" y="0" rx="8" ry="8" width="100%" height="200" />
                  <Rect x="0" y="220" rx="8" ry="8" width="100%" height="200" />
                </ContentLoader>
              </View>
            ) : recipes.length > 0 ? (
              <FlatList
                data={recipes}
                className="w-full px-6 pt-4"
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <Animated.View
                    className={`p-4 my-3 rounded-md mb-${
                      index === recipes.length - 1 ? "16" : "3"
                    }`}
                    style={{
                      backgroundColor: theme.input.backgroundColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 5,
                      opacity: animatedItems[index]?.opacity || 1,
                      transform: [
                        {
                          scale:
                            animatedItems[index]?.opacity.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.97, 1],
                            }) || 1,
                        },
                      ],
                    }}>
                    <Animated.Text
                      style={{
                        color: theme.primaryText,
                        fontFamily: "Montserrat_700Bold",
                      }}
                      className="text-lg font-bold mb-4">
                      {item.name}
                    </Animated.Text>

                    <Animated.Text
                      style={{
                        color: theme.primaryText,
                        opacity:
                          animatedItems[index]?.opacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }) || 1,
                      }}
                      className="mb-5">
                      {item.description}
                    </Animated.Text>

                    <Animated.Text
                      style={{
                        color: theme.primaryText,
                        opacity:
                          animatedItems[index]?.opacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }) || 1,
                      }}
                      className="font-semibold mb-2">
                      Instructions
                    </Animated.Text>

                    <Animated.View
                      style={{
                        maxHeight: animatedItems[index]?.height.interpolate({
                          inputRange: [0.5, 1],
                          outputRange: ["50%", "100%"],
                        }),
                        opacity:
                          animatedItems[index]?.opacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 1],
                          }) || 1,
                      }}>
                      {renderInstructions(item.instructions)}
                    </Animated.View>

                    <TouchableOpacity
                      className="self-end mt-3 p-2 rounded-full bg-[#26A875]"
                      onPress={() => {
                        const recipeText = `Recipe: ${item.name}\n\nDescription: ${item.description}\n\nInstructions:\n${item.instructions}`;
                        Share.share({ message: recipeText });
                      }}>
                      <Icon name="share" size={22} color="white" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              />
            ) : (
              <Animated.View
                style={{
                  opacity: emptyStateOpacity,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                }}
                pointerEvents={
                  ingredients.length === 0 && !searchTerm ? "auto" : "none"
                }>
                <Animated.Image
                  source={require("@/assets/images/empty_bowl.png")}
                  className="w-[100px] h-[100px]"
                  style={{
                    opacity: emptyStateOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], // Maintains the 0.5 opacity from your original
                    }),
                    transform: [
                      {
                        scale: emptyStateOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  }}
                  resizeMode="contain"
                />
                <Animated.Text
                  style={{
                    color: theme.primaryText,
                    fontFamily: "Montserrat_400Regular",
                    letterSpacing: 0.2,
                    fontSize: 16,
                    textAlign: "center",
                    marginTop: 20,
                    opacity: emptyStateOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], // Maintains the 0.5 opacity from your original
                    }),
                    transform: [
                      {
                        translateY: emptyStateOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  }}>
                  Your digital pantry is empty.{"\n"} Add an ingredient to get
                  started.
                </Animated.Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Bottom generate button */}
        {ingredients.length > 1 && (
          <KeyboardAvoidingView
            className="absolute bottom-[100px] left-0 right-0 items-center"
            style={{ zIndex: 10 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <TouchableOpacity
              className={`py-3 px-8 rounded-full w-[225px] shadow-md bg-[#26A875] ${
                isGenerating ? "opacity-50" : "opacity-100"
              }`}
              disabled={isGenerating}
              activeOpacity={0.7}
              onPress={() => {
                setSearchTerm("");
                setSuggestions([]);
                fetchRecipe();
              }}>
              <Text className="text-white text-center text-lg font-bold">
                {isGenerating ? "Generating..." : "Generate Recipe"}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
        <View className="h-[80px]" />
        {/* Extra space to push content above the bottom tab bar */}
      </View>
    </MenuProvider>
  );
}
