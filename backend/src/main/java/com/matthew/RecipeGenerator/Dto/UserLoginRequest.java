package com.matthew.RecipeGenerator.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;
}