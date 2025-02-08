package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;

import java.util.List;
import java.util.Optional;

public interface RecipeService {

    List<Recipe> getAllRecipes();
    Recipe getById(int id);
    Optional<Recipe> getByName(String name);
    Recipe addRecipe(Recipe recipe);
    boolean removeRecipe(int id);
    Recipe updateRecipe(int id, Recipe updatedRecipe);

}
