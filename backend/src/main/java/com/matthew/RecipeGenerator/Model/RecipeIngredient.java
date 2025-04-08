package com.matthew.RecipeGenerator.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "recipe_ingredient")
public class RecipeIngredient {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Getter
    @Setter
    @ManyToOne // Many RecipeIngredients can be associated with a single Recipe.
    @JoinColumn(name = "recipe_id", nullable = false)
    @JsonBackReference
    private Recipe recipe;

    @Getter
    @Setter
    @ManyToOne // Many RecipeIngredients can belong to one Ingredient.
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Getter
    @Setter
    @Column(name = "quantity", nullable = true)
    private String quantity; // Stores the amount (e.g., "200", "2", "1/2").

    @Getter
    @Setter
    @Column(name = "unit", nullable = true)
    private String unit; // Stores the measurement unit (e.g., "grams", "cups", "tablespoons").
}