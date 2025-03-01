import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors, darkTheme, lightTheme } from '@/constants/Colors';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { router } from 'expo-router';

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
  const [inputValue, setInputValue] = useState<string>('');
  const [username, setUsername] = useState<string>('JohnDoe'); // Replace with actual username retrieval logic
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Fetch the username from AsyncStorage or API
    const fetchUsername = async () => {
      // Replace with actual logic to fetch username
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    fetchUsername();
  }, []);

  const fetchRecipe = async () => {
    setIsGenerating(true);
    try {
      const response = await api.get<Recipe[]>(`/recipes?ingredients=${ingredients.join(',')}`);
      setRecipes(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error fetching recipes');
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

  return (
    <MenuProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={[styles.header, { backgroundColor: Colors.primary }]}>
          <Text style={styles.headerText}>Welcome, {username}</Text>
          <Menu>
            <MenuTrigger>
              <View style={styles.initialCircle}>
                <Text style={styles.initialText}>{username.charAt(0).toUpperCase()}</Text>
              </View>
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={handleSignOut} customStyles={{ optionText: styles.menuOptionText }}>
                <Text style={styles.menuOptionText}>Sign Out</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.ingredientContainer}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredient}>
                  <Text>{ingredient.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())}</Text>
                  <TouchableOpacity onPress={() => deleteIngredient(index)}>
                    <Text style={styles.deleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter ingredient"
              placeholderTextColor="darkgray"
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleAddIngredient}
            />
            <Button title="Generate Recipe" onPress={fetchRecipe} />
            <View style={styles.recipeContainer}>
              {isGenerating ? (
                <Text>Generating...</Text>
              ) : recipes.length > 0 ? (
                <FlatList
                  data={recipes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.recipe}>
                      <Text style={styles.recipeTitle}>{item.name}</Text>
                      <Text>Instructions: {item.instructions}</Text>
                      <Text>Description: {item.description}</Text>
                    </View>
                  )}
                />
              ) : (
                <Text>No recipes found</Text>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: -(StatusBar.currentHeight || 60),
    paddingTop: StatusBar.currentHeight || 60, // Adjust padding to account for status bar
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
    color: Colors.primary,
  },
  menuOptionText: {
    margin: 10,
    fontSize: 15,
    fontWeight: 400,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  ingredientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    margin: 4,
    borderRadius: 4,
  },
  deleteButton: {
    marginLeft: 8,
    color: 'red',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  recipeContainer: {
    flex: 1,
  },
  recipe: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
    borderRadius: 4,
  },
  recipeTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});