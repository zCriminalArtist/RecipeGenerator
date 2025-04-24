package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Dto.AppleLatestReceiptInfo;
import com.matthew.RecipeGenerator.Dto.ApplePendingRenewalInfo;
import com.matthew.RecipeGenerator.Dto.AppleReceiptResponse;
import com.matthew.RecipeGenerator.Dto.UserSubscriptionRequest;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import com.matthew.RecipeGenerator.Repo.UserSubscriptionRepo;
import com.matthew.RecipeGenerator.Service.StripeService;
import com.matthew.RecipeGenerator.Service.SubscriptionService;
import com.matthew.RecipeGenerator.Verifier.AppleReceiptVerifier;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.SetupIntentCreateParams;
import com.stripe.param.SubscriptionItemListParams;
import com.stripe.param.SubscriptionListParams;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private AppleReceiptVerifier appleVerifier;

    @Autowired
    private SubscriptionService subscriptionService;

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

                subscriptionService.syncAppleSubscription(user, latest, isInBillingRetryPeriod);

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