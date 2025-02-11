package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IngredientRepo extends JpaRepository<Ingredient, Integer> {

    Optional<Ingredient> findByName(String name);

}
