package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Service.IngredientService;
import com.matthew.RecipeGenerator.Service.OpenAIService;
import com.matthew.RecipeGenerator.Service.RecipeIngredientService;
import com.matthew.RecipeGenerator.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/recipes")
public class RecipeController {

    @Autowired
    private OpenAIService openAIService;
    @Autowired
    private RecipeService recipeService;
    @Autowired
    private IngredientService ingredientService;
    @Autowired
    private RecipeIngredientService recipeIngredientService;

    @GetMapping
    public ResponseEntity<?> getRecipes(@RequestParam(required = false) List<String> ingredients, @AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        if (ingredients == null || ingredients.isEmpty()) {
            List<Recipe> allRecipes = recipeService.getRecipesByUser(user);
            for (Recipe recipe : allRecipes) {
                List<RecipeIngredient> recipeIngredients = recipeIngredientService.getRecipeIngredientsByRecipeId(recipe.getId());
                recipe.setRecipeIngredients(recipeIngredients);
            }
            return ResponseEntity.ok(allRecipes);
        } else {
            Set<Ingredient> ingredientSet = new HashSet<>();
            for (String ingredientName : ingredients) {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(ingredientName);
                ingredient.setCategory("");
                ingredientSet.add(ingredientService.addIngredient(ingredient));
            }

            String raw_recipe = openAIService.generateRecipe(String.join(", ", ingredients));
            List<Recipe> recipes = openAIService.parseRecipes(raw_recipe);
            for (Recipe recipe : recipes) {
                System.out.println(user.getUsername());
                recipe.setUser(user);
                recipeService.addRecipe(recipe);

                for (Ingredient ingredient : ingredientSet) {
                    RecipeIngredient recipeIngredient = new RecipeIngredient();
                    recipeIngredient.setRecipe(recipe);
                    recipeIngredient.setIngredient(ingredient);
                    recipeIngredient.setQuantity("1"); // Set default quantity
                    recipeIngredient.setUnit("unit"); // Set default unit
                    recipeIngredientService.addRecipeIngredient(recipeIngredient);
                }
            }
            return ResponseEntity.ok(recipes);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable int id) {
        Recipe recipe = recipeService.getRecipeById(id);
        return (recipe != null)
                ? new ResponseEntity<>(recipe, HttpStatus.OK)
                : new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }
}