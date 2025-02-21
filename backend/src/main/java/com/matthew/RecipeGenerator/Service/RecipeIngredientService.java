package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.DTO.UpdateRecipeIngredientDTO;
import com.matthew.RecipeGenerator.Model.RecipeIngredient;

import java.util.List;
import java.util.Optional;

public interface RecipeIngredientService {
    List<RecipeIngredient> getAllRecipeIngredients();
    Optional<RecipeIngredient> getRecipeIngredientById(int id);
    RecipeIngredient addRecipeIngredient(RecipeIngredient recipeIngredient);
    List<RecipeIngredient> getRecipeIngredientsByRecipeId(int recipeId);
    boolean removeRecipeIngredient(int id);
    void updateRecipeIngredient(int id, UpdateRecipeIngredientDTO updatedRecipeIngredient);
}