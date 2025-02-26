package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Dto.UpdateRecipeIngredient;
import com.matthew.RecipeGenerator.Service.IngredientService;
import com.matthew.RecipeGenerator.Service.OpenAIService;
import com.matthew.RecipeGenerator.Service.RecipeIngredientService;
import com.matthew.RecipeGenerator.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recipeIngredients")
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
    public ResponseEntity<Void> updateRecipeIngredient(@PathVariable("recipeIngredientId") int id, @RequestBody UpdateRecipeIngredient updatedRecipeIngredient) {
        recipeIngredientService.updateRecipeIngredient(id, updatedRecipeIngredient);
        return ResponseEntity.ok().build();
    }
}