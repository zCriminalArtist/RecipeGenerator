import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar, useColorScheme, Keyboard, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import { Colors, darkTheme, lightTheme } from '@/constants/Colors';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import IngredientContainer from '@/components/ui/IngredientContainer';
import ProfileMenu from '@/components/ui/ProfileMenu';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string, brandOwner: string }[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [username, setUsername] = useState<string>('JohnDoe');
  const colorScheme = useColorScheme();
  const usda_api_key = process.env.EXPO_PUBLIC_USDA_API_KEY || 'default_usda_api_key';
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [ingredients]);

  useEffect(() => {
    const fetchUsername = async () => {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        const decodedToken = jwtDecode(token);
        const username = (decodedToken as { username: string }).username;
        console.log('Username:', username);
        if (username) {
          setUsername(username);
        }
      }
    };

    fetchUsername();
  }, []);

  const fetchRecipe = async () => {
    setIsGenerating(true);
    setSearchTerm('');
    Keyboard.dismiss();
    try {
      const encodedIngredients = ingredients.map(ing => encodeURIComponent(ing)).join(',');
      const response = await api.get<Recipe[]>(`/recipes?ingredients=${encodedIngredients}`);
      setRecipes(response.data);
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
      
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('jwt');
    router.push('/login');
  };

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const renderInstructions = (instructions: string) => {
    const steps = instructions.split(/\d+\.\s/).filter(step => step.trim() !== '');
    return steps.map((step, index) => (
      <View key={index} style={styles.instructionStep}>
        <Text style={[styles.instructionNumber, { color: theme.primaryText }]}>{`${index + 1}.`}</Text>
        <Text style={[styles.instructionText, { color: theme.primaryText }]}>{step}</Text>
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

      const foundationFoods = foods.filter((food: any) => food.dataType === 'Foundation');
      const otherFoods = foods.filter((food: any) => food.dataType !== 'Foundation');

      const remainingSlots = 10 - foundationFoods.length;
      const finalFoods = foundationFoods.slice(0, 10).concat(otherFoods.slice(0, remainingSlots));

      const transformed = finalFoods.slice(0, 10).map((food: any, index: number) => {
        const originalName = food.description.trim();
        const displayedName =
          originalName.charAt(0).toUpperCase() + originalName.slice(1).toLowerCase();
        return {
          id: index.toString(),
          name: displayedName,
          brandOwner: food.brandOwner || '',
        };
      });
      setSuggestions(transformed);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  return (
    <MenuProvider>
      {/* <TouchableWithoutFeedback> */}
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <StatusBar barStyle="light-content" backgroundColor={ theme.primary } />
          <View style={[styles.header, { maxHeight: 250, backgroundColor: theme.primary }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>Welcome, {username}</Text>
              <ProfileMenu
                  username={username}
                  onSignOut={handleSignOut}
                  onSubscription={() => router.push('/subscription')}
                  theme={theme}
              />
            </View>
            <IngredientContainer ingredients={ingredients} deleteIngredient={deleteIngredient} theme={theme} />
          </View>
          <View style={[{ marginTop: 16, padding: 16, paddingTop: -16, paddingBottom: -16 }]}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, theme.input]}
                placeholder="Enter ingredient"
                placeholderTextColor="darkgray"
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  fetchIngredientSuggestions(text);
                }}
              />
            </View>
          </View>
          {suggestions.length > 0 && searchTerm && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              style={{ backgroundColor: theme.suggestionsBackground, maxHeight: 250, flexGrow: 0, marginBottom: 0, width: '100%' }}
              renderItem={({ item, index }) => {
                const lastItem = index === suggestions.length - 1;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setIngredients([...ingredients, item.name]);
                      setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== item.id));
                    }}
                    style={[
                      styles.suggestionItem, { backgroundColor: theme.suggestionsBackground },
                      lastItem && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View>
                      <Text style={{ margin: 20, marginRight: 40, color: theme.primaryText }}>{item.name}</Text>
                      {item.brandOwner ? (
                        <Text style={{ marginLeft: 20, marginTop: -20, marginBottom: 15, color: theme.secondaryText }}>
                          {item.brandOwner}
                        </Text>
                      ) : null}
                      <View style={[styles.addButton, { opacity: 0.8, backgroundColor: 'transparent',} ]} >
                        <Icon name="add-circle" size={25} color={ theme.secondaryText } />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          <View style={styles.container}>
            {isGenerating ? (
              <View style={{ padding: 16, width: '100%' }}>
                <ContentLoader
                  speed={1}
                  width="100%"
                  height={500}
                  backgroundColor={theme.background}
                  foregroundColor={theme.secondaryText}>
                  <Rect x="0" y="0" rx="4" ry="4" width="100%" height="200"/>
                  <Rect x="0" y="220" rx="4" ry="4" width="100%" height="200"/>
                </ContentLoader>
              </View>
            ) : recipes.length > 0 ? (
              <FlatList
                data={recipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <View style={[styles.recipe, { marginBottom: index === recipes.length - 1 ? 60 : 5, backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.recipeTitle, {color: theme.primaryText }]}>{item.name}</Text>
                    <Text style={[ { marginBottom: 20, color: theme.primaryText }]}>{item.description}</Text>
                    <Text style={[ { fontWeight: '600', marginBottom: 3, color: theme.primaryText }]}>Instructions</Text>
                    {renderInstructions(item.instructions)}
                  </View>
                )}
              />
            ) : (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Text style={[{ marginTop: 20, color: theme.secondaryText }]}>Add '+' ingredients to get started</Text>
              </TouchableWithoutFeedback>
            )} 
          </View>
          {ingredients.length > 0 && (
            <KeyboardAvoidingView
              style={styles.footer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <TouchableOpacity style={[ styles.generateButton, { backgroundColor: theme.secondary, }]} 
                onPress={() => {
                  setSearchTerm('');
                  setSuggestions([]);
                  fetchRecipe();
                }}>
                  <Text style={styles.generateButtonText}>Generate Recipe</Text>
                </TouchableOpacity>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          )}
        </SafeAreaView>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: -16,
    marginTop: -(StatusBar.currentHeight || 60),
    paddingTop: StatusBar.currentHeight || 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuOptionText: {
    margin: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  container: {
    paddingBottom: 50,
    flex: 1,
    alignItems: 'center',
  },
  ingredientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 20,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#f0f0f0',
    padding: 0,
    margin: 4,
    borderRadius: 4,
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  deleteButtonText: {
    fontSize: 18,
    color: 'red',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  input: {
    flex: 1,
    height: 60,
    marginHorizontal: -25,
    paddingHorizontal: 25,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 0,
    borderStyle: 'solid',
  },
  addButton: {
    position: 'absolute',
    alignSelf: 'center',
    height: '100%',
    justifyContent: 'center',
    right: 15,
    padding: 0,
  },
  recipeContainer: {
    flex: 1,
    padding: 1,
    alignItems: 'center',
  },
  recipe: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  instructionNumber: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    margin: 16,
    alignItems: 'center',
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionItem: {
    width: '100%',
    backgroundColor: '#DDD',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  gradientTop: {
    position: 'absolute',
    top: 0, // match the padding of the container
    left: 0,
    right: 0,
    height: 30,
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 1,
  },
});
