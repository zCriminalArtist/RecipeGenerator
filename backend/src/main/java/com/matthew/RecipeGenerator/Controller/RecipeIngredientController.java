package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.DTO.UpdateRecipeIngredientDTO;
import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import com.matthew.RecipeGenerator.Service.IngredientService;
import com.matthew.RecipeGenerator.Service.OpenAIService;
import com.matthew.RecipeGenerator.Service.RecipeIngredientService;
import com.matthew.RecipeGenerator.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recipeIngredients")
@CrossOrigin(origins = "http://localhost:5173")
public class RecipeIngredientController {

    @Autowired
    private OpenAIService openAIService;
    @Autowired
    private RecipeService recipeService;
    @Autowired
    private IngredientService ingredientService;
    @Autowired
    private RecipeIngredientService recipeIngredientService;

    @PutMapping("/{recipeIngredientId}")
    public ResponseEntity<Void> updateRecipeIngredient(@PathVariable("recipeIngredientId") int id, @RequestBody UpdateRecipeIngredientDTO updatedRecipeIngredient) {
        recipeIngredientService.updateRecipeIngredient(id, updatedRecipeIngredient);
        return ResponseEntity.ok().build();
    }
}