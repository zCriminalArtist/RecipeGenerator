package com.matthew.RecipeGenerator.Model;

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
@Table(name = "recipe_ingredients")
public class RecipeIngredient {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Getter
    @Setter
    @Column(name = "quantity", nullable = false)
    private String quantity; // Stores the amount (e.g., "200", "2", "1/2").

    @Getter
    @Setter
    @Column(name = "unit", nullable = false)
    private String unit; // Stores the measurement unit (e.g., "grams", "cups", "tablespoons").
}