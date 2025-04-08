package com.matthew.RecipeGenerator.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.IngredientRepo;
import com.matthew.RecipeGenerator.Repo.RecipeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RecipeServiceImpl implements RecipeService {

    @Autowired
    RecipeRepo recipeRepo;

    @Autowired
    IngredientRepo ingredientRepo;

    @Override
    public List<Recipe> getAllRecipes() {
        return recipeRepo.findAll();
    }

    @Override
    public List<Recipe> createRecipesFromAIResponse(JsonNode aiResponse, User user) {
        List<Recipe> recipes = new ArrayList<>();
        if (aiResponse.isArray()) {
            for (JsonNode recipeNode : aiResponse) {
                Recipe recipe = new Recipe();
                recipe.setName(recipeNode.get("name").asText(""));
                recipe.setDescription(recipeNode.get("description").asText(""));
                recipe.setInstructions(recipeNode.get("instructions").asText(""));

                StringBuilder instructions = new StringBuilder();
                JsonNode instructionNode = recipeNode.get("instructions");
                if (instructionNode != null) {
                    if (instructionNode.isArray()) {
                        for (JsonNode instruction : instructionNode) {
                            instructions.append(instruction.asText()).append("\n");
                        }
                    } else {
                        instructions.append(instructionNode.asText());
                    }
                }
                recipe.setInstructions(instructions.toString());

                List<RecipeIngredient> recipeIngredients = new ArrayList<>();

                JsonNode ingredientsArray = recipeNode.get("ingredients");
                if (ingredientsArray != null && ingredientsArray.isArray()) {
                    for (JsonNode ingredientNode : ingredientsArray) {
                        String name = ingredientNode.get("ingredientName").asText();

                        Ingredient ingredient = ingredientRepo.findByName(name)
                                .orElseGet(() -> {
                                    Ingredient newIngredient = new Ingredient();
                                    newIngredient.setName(name);
                                    newIngredient.setCategory("");
                                    return ingredientRepo.save(newIngredient);
                                });

                        RecipeIngredient ri = new RecipeIngredient();
                        ri.setIngredient(ingredient);
                        ri.setRecipe(recipe);
                        ri.setQuantity(ingredientNode.get("quantity").asText());
                        ri.setUnit(ingredientNode.get("unit").asText());

                        recipeIngredients.add(ri);
                    }
                }
                recipe.setRecipeIngredients(recipeIngredients);
                recipe.setUser(user);
                recipes.add(recipe);
                recipeRepo.save(recipe);
            }
        }
        return recipes;
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

    @Override
    public List<Recipe> getRecipesByUser(User user) {
        return recipeRepo.findByUser(user);
    }
}