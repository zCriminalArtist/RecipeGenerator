package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeIngredientRepo extends JpaRepository<RecipeIngredient, Integer> {
}
