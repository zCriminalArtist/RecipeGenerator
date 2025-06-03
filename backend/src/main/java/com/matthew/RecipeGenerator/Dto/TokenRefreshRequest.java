package com.matthew.RecipeGenerator.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
    @NotBlank
    private String refreshToken;
}