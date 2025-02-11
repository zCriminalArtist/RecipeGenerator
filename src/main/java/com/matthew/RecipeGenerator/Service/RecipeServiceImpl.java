package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Repo.IngredientRepo;
import com.matthew.RecipeGenerator.Repo.RecipeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeServiceImpl implements RecipeService {

    @Autowired
    RecipeRepo recipeRepo;

    @Override
    public List<Recipe> getAllRecipes() {
        return recipeRepo.findAll();
    }

    @Override
    public Recipe getRecipeById(int id) {
        return recipeRepo.findById(id).orElse(null);
    }

    @Override
    public Optional<Recipe> getRecipeByName(String name) {
        return recipeRepo.findByName(name);
    }

    @Override
    public Recipe addRecipe(Recipe recipe) {
        return recipeRepo.save(recipe);
    }

    @Override
    public boolean removeRecipe(int id) {
        if (recipeRepo.existsById(id)) {
            recipeRepo.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Recipe updateRecipe(int id, Recipe updatedRecipe) {
        Recipe existingRecipe = recipeRepo.findById(id).orElse(null);
        if (existingRecipe == null) return null;

        existingRecipe.setName(updatedRecipe.getName());
        existingRecipe.setDescription(updatedRecipe.getDescription());
        existingRecipe.setInstructions(updatedRecipe.getInstructions());
        return recipeRepo.save(existingRecipe);
    }
}