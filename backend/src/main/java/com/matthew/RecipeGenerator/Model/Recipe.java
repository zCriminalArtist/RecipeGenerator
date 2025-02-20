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
@Table(name = "recipes")
public class Recipe {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Getter
    @Setter
    @Column(name = "name", nullable = false, columnDefinition = "TEXT")
    private String name;

    @Getter
    @Setter
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Getter
    @Setter
    @Column(name = "instructions", nullable = false, columnDefinition = "TEXT")
    private String instructions;
}