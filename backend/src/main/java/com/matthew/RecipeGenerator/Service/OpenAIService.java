package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.Recipe;

import java.util.List;

public interface OpenAIService {
    String generateRecipe(String ingredients);
    List<Recipe> parseRecipes(String responseBody);
}