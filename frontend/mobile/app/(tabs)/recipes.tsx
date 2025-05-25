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
} from "react-native";
import { Colors, darkTheme, lightTheme } from "@/constants/Colors";
import api from "@/utils/api";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ContentLoader, { Rect } from "react-content-loader/native";
import Icon from "react-native-vector-icons/MaterialIcons";

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

  // Add new animated value for header shadow
  const headerShadowOpacity = useRef(new Animated.Value(0)).current;

  // Interpolate header shadow opacity based on scroll position
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
  }, [searchQuery, recipes]);

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

  // Update the handleScroll function to connect our new animated value
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false, // Need to set to false since we're animating shadowOpacity
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Get the current scroll position
        const offsetY = event.nativeEvent.contentOffset.y;
        // Update the shadow opacity animated value
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

  const filterRecipes = () => {
    const filtered = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecipes(filtered);
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

    const animatedItem = animatedItems[index] || {
      opacity: new Animated.Value(1),
      height: new Animated.Value(1),
      expanded: new Animated.Value(0),
    };

    return (
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleRecipeExpansion(item.id, index)}
          className="flex-row justify-between items-center mb-4">
          <Animated.Text
            style={{
              color: theme.primaryText,
              fontFamily: "Montserrat_700Bold",
            }}
            className="text-lg font-bold mb-1">
            {item.name}
          </Animated.Text>

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
            <Icon name="expand-more" size={28} color={theme.secondaryText} />
          </Animated.View>
        </TouchableOpacity>

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

        <Animated.Text
          style={{
            color: theme.primaryText,
            opacity:
              animatedItem.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }) || 1,
          }}
          className="font-semibold mb-2">
          Ingredients
        </Animated.Text>

        <Animated.View
          style={{
            maxHeight: animatedItem.expanded.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "1000%"],
            }),
            overflow: "hidden",
            opacity:
              animatedItem.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }) || 1,
          }}>
          {item.recipeIngredients.map((recipeIngredient) => (
            <View
              key={recipeIngredient.id}
              className="flex-row items-center ml-2.5 mb-1.5">
              <Text className="my-1" style={{ color: theme.primaryText }}>
                {recipeIngredient.ingredient.name.replace(
                  /\b\w+/g,
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )}
              </Text>

              <View className="absolute flex-row right-5 items-center">
                <TextInput
                  className="ml-2.5 pl-2 py-1 min-w-0 rounded-l-full"
                  style={{
                    color: theme.primaryText,
                    backgroundColor: theme.secondaryText,
                  }}
                  placeholder="Quantity"
                  value={
                    editedIngredients[recipeIngredient.id]?.quantity ||
                    recipeIngredient.quantity
                  }
                  onChangeText={(text) =>
                    setEditedIngredients((prev) => ({
                      ...prev,
                      [recipeIngredient.id]: {
                        quantity: text,
                        unit:
                          prev[recipeIngredient.id]?.unit ||
                          recipeIngredient.unit,
                      },
                    }))
                  }
                />
                <TextInput
                  className="px-1 py-1 pr-2 min-w-0 rounded-r-full"
                  style={{
                    color: theme.primaryText,
                    backgroundColor: theme.secondaryText,
                  }}
                  value={
                    editedIngredients[recipeIngredient.id]?.unit ||
                    recipeIngredient.unit
                  }
                  onChangeText={(text) =>
                    setEditedIngredients((prev) => ({
                      ...prev,
                      [recipeIngredient.id]: {
                        quantity:
                          prev[recipeIngredient.id]?.quantity ||
                          recipeIngredient.quantity,
                        unit: text,
                      },
                    }))
                  }
                />
                {editedIngredients[recipeIngredient.id] && (
                  <TouchableOpacity
                    className="ml-1.5"
                    onPress={() => handleUpdate(recipeIngredient.id)}>
                    <Icon name="save" size={20} color={theme.primaryText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.Text
          style={{
            color: theme.primaryText,
            opacity:
              animatedItem.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }) || 1,
            marginTop: animatedItem.expanded.interpolate({
              inputRange: [0, 1],
              outputRange: [3, 15],
            }),
          }}
          className="font-semibold my-1.5">
          Instructions
        </Animated.Text>

        <Animated.View
          style={{
            maxHeight: animatedItem.height.interpolate({
              inputRange: [0.5, 1],
              outputRange: ["50%", "100%"],
            }),
            opacity:
              animatedItem.opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }) || 1,
          }}>
          {renderInstructions(item.instructions)}
        </Animated.View>

        <View className="flex-row justify-end items-center mt-3">
          <TouchableOpacity
            className="p-2 rounded-full bg-gray-400 dark:bg-gray-600 mr-3"
            onPress={() => handleDeleteRecipe(item.id)}>
            <Icon name="delete" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 rounded-full bg-[#26A875]"
            onPress={() => {
              const recipeText = `Recipe: ${item.name}\n\nDescription: ${item.description}\n\nInstructions:\n${item.instructions}`;
              Share.share({ message: recipeText });
            }}>
            <Icon name="share" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
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
          // Add dynamic shadow based on scroll position
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
            barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
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
            <TouchableOpacity onPress={() => fetchRecipes()}>
              <Icon name="refresh" size={30} color="#8BDBC1" />
            </TouchableOpacity>
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
          <View className="p-6 w-full">
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
    </View>
  );
}
