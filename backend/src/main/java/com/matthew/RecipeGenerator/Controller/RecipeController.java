package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Service.*;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
    public ResponseEntity<?> getRecipes(@AuthenticationPrincipal(errorOnInvalidType = true) User user, HttpServletRequest request) {
        String rawQuery = request.getQueryString();
        if (rawQuery == null || !rawQuery.contains("ingredients=")) {
            List<Recipe> allRecipes = recipeService.getRecipesByUser(user);
            for (Recipe recipe : allRecipes) {
                List<RecipeIngredient> recipeIngredients = recipeIngredientService.getRecipeIngredientsByRecipeId(recipe.getId());
                recipe.setRecipeIngredients(recipeIngredients);
            }
            return ResponseEntity.ok(allRecipes);
        } else {
            String status = user.getSubscription().getStatus();
            switch (status) {
                case "EXPIRED" -> {
                    return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body("Subscription expired. Please renew your subscription.");
                }
                case "REVOKED" -> {
                    return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body("Subscription revoked. Please contact support.");
                }
                default -> {
                }
            }

            String ingredients = rawQuery.substring(rawQuery.indexOf("ingredients=") + "ingredients=".length());
            List<String> ingredientsList = Arrays.stream(ingredients.split(","))
                    .map(ingredient -> URLDecoder.decode(ingredient, StandardCharsets.UTF_8))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(recipeService.createRecipesFromAIResponse(openAIService.generateRecipe(String.join(", ", ingredientsList)), user));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@AuthenticationPrincipal(errorOnInvalidType = true) User user, @PathVariable int id) {
        Recipe recipe = recipeService.getRecipeById(user, id);
        return (recipe != null)
                ? new ResponseEntity<>(recipe, HttpStatus.OK)
                : new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@AuthenticationPrincipal(errorOnInvalidType = true) User user, @PathVariable int id) {
        recipeService.deleteRecipe(user, id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Recipe> toggleFavorite(@AuthenticationPrincipal(errorOnInvalidType = true) User user, @PathVariable int id) {
        return ResponseEntity.ok(recipeService.toggleFavorite(user, id));
    }
}