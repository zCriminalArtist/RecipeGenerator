package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeIngredientRepo extends JpaRepository<RecipeIngredient, Integer> {
    List<RecipeIngredient> findByRecipeId(int recipeId);

}
