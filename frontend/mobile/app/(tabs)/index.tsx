import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, FlatList, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import api from '@/utils/api';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
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
