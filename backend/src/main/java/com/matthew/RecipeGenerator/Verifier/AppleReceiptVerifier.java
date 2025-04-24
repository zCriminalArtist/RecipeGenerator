package com.matthew.RecipeGenerator.Verifier;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matthew.RecipeGenerator.Dto.AppleReceiptResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@Slf4j
public class AppleReceiptVerifier {

    private static final String PROD_URL = "https://buy.itunes.apple.com/verifyReceipt";

    private static final String SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

    @Value("${apple.shared.secret}")
    private String appleSharedSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public AppleReceiptResponse verifyReceipt(String base64Receipt) {
        Map<String, Object> requestBody = Map.of(
                "receipt-data", base64Receipt,
                "password", appleSharedSecret
        );

        AppleReceiptResponse response = postReceipt(PROD_URL, requestBody);

        if (response.getStatus() == 21007) {
            log.info("Switching to sandbox environment for Apple receipt");
            response = postReceipt(SANDBOX_URL, requestBody);
        }

        return response;
    }

    private AppleReceiptResponse postReceipt(String url, Map<String, Object> requestBody) {
        try {
            String responseJson = restTemplate.postForObject(url, requestBody, String.class);
            return objectMapper.readValue(responseJson, AppleReceiptResponse.class);
        } catch (Exception e) {
            log.error("Apple receipt verification failed", e);
            return new AppleReceiptResponse();
        }
    }
}
