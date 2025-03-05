import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert, SafeAreaView, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors, darkTheme, lightTheme } from '@/constants/Colors';
import api from '@/utils/api';
import { useNavigation } from '@react-navigation/native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [editedIngredients, setEditedIngredients] = useState<{ [key: number]: { quantity: string; unit: string } }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerTitle: () => null,
      headerRight: () => null,
      headerSearchBarOptions: {
        placeholder: "Search",
        visible: true,
        cancelButtonText: "",
        onChangeText: (event: { nativeEvent: { text: React.SetStateAction<string>; }; }) => {
          setSearchQuery(event.nativeEvent.text);
        },
      },
    });
  }, [navigation]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, recipes]);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Recipe[]>("/recipes");
      setRecipes(response.data);
      setFilteredRecipes(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error fetching recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecipes = () => {
    const filtered = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRecipes(filtered);
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

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      await api.delete(`/recipes/${recipeId}`);
      fetchRecipes();
    } catch (error) {
      Alert.alert('Error', 'Error deleting recipe');
    }
  };

  const renderInstructions = (instructions: string) => {
    const steps = instructions.split(/\d+\.\s/).filter(step => step.trim() !== '');
    return steps.map((step, index) => (
      <View key={index} style={styles.instructionStep}>
        <Text style={[styles.instructionNumber, { color: theme.primaryText }]}>{`${index + 1}.`}</Text>
        <Text style={[styles.instructionText, { color: theme.primaryText }]}>{step}</Text>
      </View>
    ));
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <View style={[styles.recipe, { backgroundColor: theme.cardBackground }]}>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRecipe(item.id)}>
        <Icon name="delete" size={24} color={theme.secondaryText} />
      </TouchableOpacity>
      <Text style={[styles.recipeTitle, { color: theme.primaryText }]}>{item.name}</Text>
      <Text style={[{ marginBottom: 20, color: theme.primaryText }]}>{item.description}</Text>
      <Text style={[{ fontWeight: '600', marginBottom: 3, color: theme.primaryText }]}>Ingredients:</Text>
      {item.recipeIngredients.map((recipeIngredient) => (
        <View key={recipeIngredient.id} style={styles.ingredientContainer}>
          <Text style={{ color: theme.primaryText }}>{recipeIngredient.ingredient.name.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())}</Text>
          <TextInput
            style={[styles.input, { color: theme.primaryText }]}
            value={editedIngredients[recipeIngredient.id]?.quantity || recipeIngredient.quantity}
            onChangeText={(value) => handleEditChange(recipeIngredient.id, 'quantity', value)}
          />
          <TextInput
            style={[styles.input, { color: theme.primaryText }]}
            value={editedIngredients[recipeIngredient.id]?.unit || recipeIngredient.unit}
            onChangeText={(value) => handleEditChange(recipeIngredient.id, 'unit', value)}
          />
          <Button title="Update" onPress={() => handleUpdate(recipeIngredient.id)} />
        </View>
      ))}
      <Text style={[{ fontWeight: '600', marginBottom: 3, color: theme.primaryText }]}>Instructions:</Text>
      {renderInstructions(item.instructions)}
    </View>
  );

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {isLoading ? (
        <ContentLoader
          speed={1}
          width="100%"
          height={600}
          backgroundColor={theme.background}
          foregroundColor={theme.secondaryText}>
          <Rect x="0" y="0" rx="4" ry="4" width="100%" height="200" />
          <Rect x="0" y="220" rx="4" ry="4" width="100%" height="200" />
          <Rect x="0" y="440" rx="4" ry="4" width="100%" height="200" />
        </ContentLoader>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecipe}
          contentContainerStyle={styles.container}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: 0,
    marginBottom: 80,
    padding: 16,
  },
  container: {
    padding: 16,
  },
  recipe: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
    borderRadius: 4,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
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
});