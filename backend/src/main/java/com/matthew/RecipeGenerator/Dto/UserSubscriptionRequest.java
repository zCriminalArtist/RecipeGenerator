package com.matthew.RecipeGenerator.Dto;

import lombok.Data;

@Data
public class UserSubscriptionRequest {
    private String platform;
    private String receipt;
    private String productId;
}