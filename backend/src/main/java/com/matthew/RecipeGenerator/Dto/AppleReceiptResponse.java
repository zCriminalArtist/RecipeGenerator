package com.matthew.RecipeGenerator.Dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppleReceiptResponse {
    private int status;
    private String environment;
    @JsonProperty("latest_receipt_info")
    private List<AppleLatestReceiptInfo> latestReceiptInfo = new ArrayList<>();
    @JsonProperty("pending_renewal_info")
    private List<ApplePendingRenewalInfo> pendingRenewalInfo = new ArrayList<>();
}