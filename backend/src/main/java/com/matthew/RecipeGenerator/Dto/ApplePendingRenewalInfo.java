package com.matthew.RecipeGenerator.Dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplePendingRenewalInfo {

    @JsonProperty("auto_renew_status")
    private String autoRenewStatus;
    @JsonProperty("original_transaction_id")
    private String originalTransactionId;
    @JsonProperty("is_in_billing_retry_period")
    private String isInBillingRetryPeriod;
}
