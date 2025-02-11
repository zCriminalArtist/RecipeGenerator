package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecipeRepo extends JpaRepository<Recipe, Integer> {

    Optional<Recipe> findByName(String name);

}
