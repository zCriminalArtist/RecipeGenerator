package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Repo.IngredientRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IngredientServiceImpl implements IngredientService {

    @Autowired
    IngredientRepo ingredientRepo;

    @Override
    public List<Ingredient> getAllIngredients() {
        return ingredientRepo.findAll();
    }

    @Override
    public Ingredient getIngredientById(int id) {
        return ingredientRepo.findById(id).orElse(null);
    }

    @Override
    public Optional<Ingredient> getIngredientByName(String name) {
        return ingredientRepo.findByName(name);
    }

    @Override
    public Ingredient addIngredient(Ingredient ingredient) {
        return ingredientRepo.save(ingredient);
    }

    @Override
    public boolean removeIngredient(int id) {
        if (ingredientRepo.existsById(id)) {
            ingredientRepo.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Ingredient updateIngredient(int id, Ingredient updatedIngredient) {
        Ingredient existingIngredient = ingredientRepo.findById(id).orElse(null);
        if (existingIngredient == null) return null;

        existingIngredient.setName(updatedIngredient.getName());
        existingIngredient.setCategory(updatedIngredient.getCategory());
        return ingredientRepo.save(existingIngredient);
    }
}
