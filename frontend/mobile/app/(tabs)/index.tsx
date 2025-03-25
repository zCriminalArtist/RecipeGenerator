import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar, useColorScheme, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import { Colors, darkTheme, lightTheme } from '@/constants/Colors';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

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
    try {
      const response = await api.get<Recipe[]>(`/recipes?ingredients=${ingredients.join(',')}`);
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

  return (
    <MenuProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <StatusBar barStyle="light-content" backgroundColor={ theme.primary } />
          <View style={[styles.header, { backgroundColor: theme.primary }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>Welcome, {username}</Text>
              <Menu>
                <MenuTrigger>
                  <View style={styles.initialCircle}>
                    <Text style={[styles.initialText, {color: theme.primary }]}>{username.charAt(0).toUpperCase()}</Text>
                  </View>
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption onSelect={handleSignOut} customStyles={{ optionText: styles.menuOptionText }}>
                    <View style={styles.menuOption}>
                      <Icon name="logout" size={20} color={theme.primaryText} />
                      <Text style={styles.menuOptionText}>Sign out</Text>
                    </View>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => { 
                      router.push('/subscription'); 
                    }}
                    customStyles={{ optionText: styles.menuOptionText }}>
                    <View style={styles.menuOption}>
                      <Icon name="loyalty" size={20} color={theme.primaryText} />
                      <Text style={styles.menuOptionText}>Subscription</Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
            <View style={styles.ingredientContainer}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredient}>
                  <Text style={{ padding: 8, height: '100%', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, color: '#212121', fontWeight: '600', marginRight: 10, backgroundColor: '#DDDDDD'}}>{`${index + 1}. `}</Text>
                  <Text style={{ color: '#212121'}}>{ingredient.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteIngredient(index)}
                    style={styles.deleteButton}
                    activeOpacity={0.3}>
                    <Icon name="close" size={18} color={darkTheme.secondaryText} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.container}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, theme.input]}
                placeholder="Enter ingredient"
                placeholderTextColor="darkgray"
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleAddIngredient}
                blurOnSubmit={false}
              />
              {inputValue.trim() !== '' && (
                <TouchableOpacity style={[styles.addButton, {backgroundColor: 'transparent',} ]} onPress={handleAddIngredient}>
                  <Icon name="add-circle" size={25} color={ theme.secondaryText } />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.recipeContainer}>
              {isGenerating ? (
                <ContentLoader
                  speed={1}
                  width="100%"
                  height={500}
                  backgroundColor={theme.background}
                  foregroundColor={theme.secondaryText}>
                  <Rect x="0" y="0" rx="4" ry="4" width="100%" height="200" />
                </ContentLoader>
              ) : recipes.length > 0 ? (
                <FlatList
                  data={recipes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={[styles.recipe, { backgroundColor: theme.cardBackground }]}>
                      <Text style={[styles.recipeTitle, {color: theme.primaryText }]}>{item.name}</Text>
                      <Text style={[ { marginBottom: 20, color: theme.primaryText }]}>{item.description}</Text>
                      <Text style={[ { fontWeight: '600', marginBottom: 3, color: theme.primaryText }]}>Instructions</Text>
                      {renderInstructions(item.instructions)}
                    </View>
                  )}
                />
              ) : (
                <Text style={[{ color: theme.primaryText }]}>Add '+' ingredients to get started</Text>
              )}
            </View>
          </View>
          {ingredients.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity style={[ styles.generateButton, { backgroundColor: theme.primary, }]} onPress={fetchRecipe}>
                <Text style={styles.generateButtonText}>Generate Recipe</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginTop: -(StatusBar.currentHeight || 60),
    paddingTop: StatusBar.currentHeight || 60, // Adjust padding to account for status bar
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
    flex: 1,
    padding: 16,
  },
  ingredientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
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
    height: 60,
    justifyContent: 'center',
    right: 0,
    padding: 0,
  },
  recipeContainer: {
    flex: 1,
    paddingTop: 16,
    padding: 1,
    alignItems: 'center',
  },
  recipe: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
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
    padding: 16,
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
});