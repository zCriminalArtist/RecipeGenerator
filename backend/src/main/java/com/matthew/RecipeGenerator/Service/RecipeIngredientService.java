package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.RecipeIngredient;

import java.util.List;
import java.util.Optional;

public interface RecipeIngredientService {
    List<RecipeIngredient> getAllRecipeIngredients();
    Optional<RecipeIngredient> getRecipeIngredientById(int id);
    RecipeIngredient addRecipeIngredient(RecipeIngredient recipeIngredient);
    boolean removeRecipeIngredient(int id);
    RecipeIngredient updateRecipeIngredient(int id, RecipeIngredient updatedRecipeIngredient);
}