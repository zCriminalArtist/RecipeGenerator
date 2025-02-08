package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.Ingredient;

import java.util.List;
import java.util.Optional;

public interface IngredientService {

    List<Ingredient> getAllIngredients();
    Ingredient getById(int id);
    Optional<Ingredient> getByName(String name);
    Ingredient addIngredient(Ingredient ingredient);
    boolean removeIngredient(int id);
    Ingredient updateIngredient(int id, Ingredient updatedIngredient);

}
