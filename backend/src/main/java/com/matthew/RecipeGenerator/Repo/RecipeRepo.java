package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeRepo extends JpaRepository<Recipe, Integer> {

    Optional<Recipe> findByName(String name);
    Optional<Recipe> findByIdAndUser(Integer id, User user);
    List<Recipe> findByUserAndFavoriteTrue(User user);
    List<Recipe> findByUser(User user);

}
