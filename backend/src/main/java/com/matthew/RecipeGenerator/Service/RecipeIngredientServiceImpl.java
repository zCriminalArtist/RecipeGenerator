package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Dto.UpdateRecipeIngredient;
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
    public List<RecipeIngredient> getRecipeIngredientsByRecipeId(int recipeId) {
        return recipeIngredientRepo.findByRecipeId(recipeId);
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
    public void updateRecipeIngredient(int id, UpdateRecipeIngredient updatedRecipeIngredient) {
        RecipeIngredient recipeIngredient = recipeIngredientRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("RecipeIngredient not found"));

        recipeIngredient.setQuantity(updatedRecipeIngredient.getQuantity());
        recipeIngredient.setUnit(updatedRecipeIngredient.getUnit());

        recipeIngredientRepo.save(recipeIngredient);
    }
}