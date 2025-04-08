package com.matthew.RecipeGenerator.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.User;

import java.util.List;
import java.util.Optional;

public interface RecipeService {

    List<Recipe> getAllRecipes();
    Recipe getRecipeById(int id);
    List<Recipe> createRecipesFromAIResponse(JsonNode aiResponse, User user);
    Optional<Recipe> getRecipeByName(String name);
    Recipe addRecipe(Recipe recipe);
    boolean removeRecipe(int id);
    Recipe updateRecipe(int id, Recipe updatedRecipe);
    List<Recipe> getRecipesByUser(User user);

}
