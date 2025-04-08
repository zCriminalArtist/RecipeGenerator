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
    private StripeService stripeService;
    @Autowired
    private RecipeService recipeService;
    @Autowired
    private IngredientService ingredientService;
    @Autowired
    private RecipeIngredientService recipeIngredientService;

    @GetMapping
    public ResponseEntity<?> getRecipes(@AuthenticationPrincipal(errorOnInvalidType=true) User user, HttpServletRequest request) {
        String status = user.getSubscriptionStatus();
        switch (status) {
            case "active":
                break;
            case "trialing":
                break;
            case "past_due", "trial_expired", "canceled":
                try {
                    return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(stripeService.issuePaymentIntent(user));
                } catch (StripeException e) {
                    return ResponseEntity.status(HttpServletResponse.SC_INTERNAL_SERVER_ERROR).body("Error retrieving subscription: " + e.getMessage());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            case "canceled_pending":
                break;
            default:
                break;
        }

        String rawQuery = request.getQueryString();
        if (rawQuery == null || !rawQuery.contains("ingredients=")) {
            List<Recipe> allRecipes = recipeService.getRecipesByUser(user);
            for (Recipe recipe : allRecipes) {
                List<RecipeIngredient> recipeIngredients = recipeIngredientService.getRecipeIngredientsByRecipeId(recipe.getId());
                recipe.setRecipeIngredients(recipeIngredients);
            }
            return ResponseEntity.ok(allRecipes);
        } else {
            String ingredients = rawQuery.substring(rawQuery.indexOf("ingredients=") + "ingredients=".length());
            System.out.println(ingredients);
            List<String> ingredientsList = Arrays.stream(ingredients.split(","))
                    .map(ingredient -> URLDecoder.decode(ingredient, StandardCharsets.UTF_8))
                    .collect(Collectors.toList());
//            Set<Ingredient> ingredientSet = new HashSet<>();
//            for (String ingredientName : ingredientsList) {
//                System.out.println(ingredientName);
//                Ingredient ingredient = new Ingredient();
//                ingredient.setName(ingredientName);
//                ingredient.setCategory("");
//                ingredientSet.add(ingredientService.addIngredient(ingredient));
//            }

//            String raw_recipe = openAIService.generateRecipe(String.join(", ", ingredientsList));
//            List<Recipe> recipes = openAIService.parseRecipes(openAIService.generateRecipe(String.join(", ", ingredientsList)));
            List<Recipe> recipes = recipeService.createRecipesFromAIResponse(openAIService.generateRecipe(String.join(", ", ingredientsList)), user);
            for (Recipe recipe : recipes) {
                recipe.setUser(user);
                recipeService.addRecipe(recipe);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable int id) {
        return recipeService.removeRecipe(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}