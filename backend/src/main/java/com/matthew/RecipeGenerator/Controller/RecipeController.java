package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Service.OpenAIService;
import com.matthew.RecipeGenerator.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recipes")
@CrossOrigin(origins = "http://localhost:5173")
public class RecipeController {

    @Autowired
    private OpenAIService openAIService;
    @Autowired
    private RecipeService recipeService;

    @GetMapping
    public ResponseEntity<String> getRecipesByIngredients(@RequestParam List<String> ingredients) {
        String raw_recipe = openAIService.generateRecipe(String.join(", ", ingredients));
        List<Recipe> recipes = openAIService.parseRecipes(raw_recipe);
        for (Recipe recipe : recipes) {
            recipeService.addRecipe(recipe);
        }
        return ResponseEntity.ok(raw_recipe);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable int id) {
        Recipe recipe = recipeService.getRecipeById(id);
        return (recipe != null)
                ? new ResponseEntity<>(recipe, HttpStatus.OK)
                : new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public Recipe addRecipe(@RequestBody Recipe recipe) {
        return recipeService.addRecipe(recipe);
    }
}