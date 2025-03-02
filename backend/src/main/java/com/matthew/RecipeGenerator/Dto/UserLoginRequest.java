package com.matthew.RecipeGenerator.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {

    @NotBlank
    private String email;

    @NotBlank
    private String password;
}