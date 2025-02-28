import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editedIngredients, setEditedIngredients] = useState<{ [key: number]: { quantity: string; unit: string } }>({});

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Recipe[]>("/recipes");
      setRecipes(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error fetching recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (id: number, field: string, value: string) => {
    setEditedIngredients((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (recipeIngredientId: number) => {
    const { quantity, unit } = editedIngredients[recipeIngredientId];
    try {
      await api.put(`/recipeIngredients/${recipeIngredientId}`, { quantity, unit });
      fetchRecipes();
    } catch (error) {
      Alert.alert('Error', 'Error updating recipe ingredient');
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeContainer}>
      <Text style={styles.recipeTitle}>{item.name}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Ingredients:</Text>
      {item.recipeIngredients.map((recipeIngredient) => (
        <View key={recipeIngredient.id} style={styles.ingredientContainer}>
          <Text>{recipeIngredient.ingredient.name.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())}</Text>
          <TextInput
            style={styles.input}
            value={editedIngredients[recipeIngredient.id]?.quantity || recipeIngredient.quantity}
            onChangeText={(value) => handleEditChange(recipeIngredient.id, 'quantity', value)}
          />
          <TextInput
            style={styles.input}
            value={editedIngredients[recipeIngredient.id]?.unit || recipeIngredient.unit}
            onChangeText={(value) => handleEditChange(recipeIngredient.id, 'unit', value)}
          />
          <Button title="Update" onPress={() => handleUpdate(recipeIngredient.id)} />
        </View>
      ))}
      <Text>Instructions: {item.instructions}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="My Recipes" onPress={fetchRecipes} />
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipe}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 16,
  },
  recipeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
    borderRadius: 4,
  },
  recipeTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: 8,
    paddingHorizontal: 8,
    flex: 1,
  },
});