package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Dto.AppleLatestReceiptInfo;
import com.matthew.RecipeGenerator.Dto.ApplePendingRenewalInfo;
import com.matthew.RecipeGenerator.Dto.AppleReceiptResponse;
import com.matthew.RecipeGenerator.Dto.UserSubscriptionRequest;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import com.matthew.RecipeGenerator.Service.SubscriptionService;
import com.matthew.RecipeGenerator.Verifier.AppleReceiptVerifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private AppleReceiptVerifier appleVerifier;

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus(@AuthenticationPrincipal(errorOnInvalidType = true) User user) {
        UserSubscription subscription = user.getSubscription();

        if (subscription == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No subscription found for the user.");
        }

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("status", subscription.getStatus());
        responseMap.put("productId", subscription.getProductId());
        responseMap.put("expirationDate", subscription.getExpirationDate());
        responseMap.put("isAutoRenew", subscription.isAutoRenew());
        responseMap.put("purchaseDate", subscription.getPurchaseDate());
        responseMap.put("isTrial", subscription.isTrial());

        if (subscription.getCancellationDate() != null) {
            responseMap.put("cancellationDate", subscription.getCancellationDate());
        }

        Map<String, Object> response = Collections.unmodifiableMap(responseMap);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifySubscription(@RequestBody UserSubscriptionRequest request, @AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        try {
            String platform = request.getPlatform();
            String receipt = request.getReceipt();
            String productId = request.getProductId();

            if (receipt == null || receipt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid receipt");
            }
            System.out.println("Receipt: " + receipt);
            System.out.println("Platform: " + platform);
            System.out.println("ProductId: " + productId);
            if ("ios".equalsIgnoreCase(platform)) {
                AppleReceiptResponse response = appleVerifier.verifyReceipt(receipt);

                if (response.getStatus() != 0 || response.getLatestReceiptInfo().isEmpty()) {
                    return ResponseEntity.badRequest().body("Invalid receipt");
                }

                AppleLatestReceiptInfo latest = response.getLatestReceiptInfo().stream()
                        .max(Comparator.comparingLong(info -> Long.parseLong(info.getExpiresDateMs())))
                        .orElseThrow();

                Map<String, ApplePendingRenewalInfo> renewalMap = new HashMap<>();
                for (ApplePendingRenewalInfo renewal : response.getPendingRenewalInfo()) {
                    renewalMap.put(renewal.getOriginalTransactionId(), renewal);
                }

                ApplePendingRenewalInfo renewal = renewalMap.get(latest.getOriginalTransactionId());
                String isInBillingRetryPeriod = renewal != null ? renewal.getIsInBillingRetryPeriod() : "0";

                try {
                    subscriptionService.syncAppleSubscription(user, latest, isInBillingRetryPeriod);
                } catch (IllegalStateException e) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
                }

                return ResponseEntity.ok("iOS subscription synced.");
            } else if ("android".equalsIgnoreCase(platform)) {

            } else {
                return ResponseEntity.badRequest().body("Invalid platform.");
            }


            return ResponseEntity.ok("Subscription verified successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Verification failed");
        }
    }
}