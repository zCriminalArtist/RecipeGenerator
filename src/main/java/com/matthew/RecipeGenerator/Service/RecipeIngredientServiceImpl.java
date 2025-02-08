package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import com.matthew.RecipeGenerator.Repo.RecipeIngredientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeIngredientServiceImpl implements RecipeIngredientService {

    @Autowired
    private RecipeIngredientRepo recipeIngredientRepo;

    @Override
    public List<RecipeIngredient> getAllRecipeIngredients() {
        return recipeIngredientRepo.findAll();
    }

    @Override
    public Optional<RecipeIngredient> getRecipeIngredientById(int id) {
        return recipeIngredientRepo.findById(id);
    }

    @Override
    public RecipeIngredient addRecipeIngredient(RecipeIngredient recipeIngredient) {
        return recipeIngredientRepo.save(recipeIngredient);
    }

    @Override
    public boolean removeRecipeIngredient(int id) {
        if (recipeIngredientRepo.existsById(id)) {
            recipeIngredientRepo.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public RecipeIngredient updateRecipeIngredient(int id, RecipeIngredient updatedRecipeIngredient) {
        Optional<RecipeIngredient> existingRecipeIngredientOpt = recipeIngredientRepo.findById(id);
        if (existingRecipeIngredientOpt.isPresent()) {
            RecipeIngredient existingRecipeIngredient = existingRecipeIngredientOpt.get();
            existingRecipeIngredient.setRecipe(updatedRecipeIngredient.getRecipe());
            existingRecipeIngredient.setIngredient(updatedRecipeIngredient.getIngredient());
            existingRecipeIngredient.setQuantity(updatedRecipeIngredient.getQuantity());
            existingRecipeIngredient.setUnit(updatedRecipeIngredient.getUnit());
            return recipeIngredientRepo.save(existingRecipeIngredient);
        }
        return null;
    }
}