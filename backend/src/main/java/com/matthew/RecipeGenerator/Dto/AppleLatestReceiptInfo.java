package com.matthew.RecipeGenerator.Dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppleLatestReceiptInfo {
    @JsonProperty("product_id")
    private String productId;
    @JsonProperty("original_transaction_id")
    private String originalTransactionId;
    @JsonProperty("transaction_id")
    private String transactionId;
    @JsonProperty("purchase_date_ms")
    private String purchaseDateMs;
    @JsonProperty("expires_date_ms")
    private String expiresDateMs;
    @JsonProperty("cancellation_date")
    private String cancellationDate;
    @JsonProperty("is_trial_period")
    private String isTrialPeriod;
}