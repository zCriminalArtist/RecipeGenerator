package com.matthew.RecipeGenerator.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.User;

import java.util.List;
import java.util.Set;

public interface OpenAIService {
    JsonNode generateRecipe(String ingredients);
    List<Recipe> parseRecipes(JsonNode aiResponse);
}