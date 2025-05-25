package com.matthew.RecipeGenerator.Service;

import com.apple.itunes.storekit.model.*;
import com.apple.itunes.storekit.verification.SignedDataVerifier;
import com.apple.itunes.storekit.verification.VerificationStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import com.matthew.RecipeGenerator.Repo.UserSubscriptionRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@Slf4j
public class AppleNotificationServiceImpl implements AppleNotificationService {

    @Autowired
    private SignedDataVerifier verifier;

    @Autowired
    private UserSubscriptionRepo subscriptionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void processNotification(String jsonPayload) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonPayload);
            String signedPayload = rootNode.get("signedPayload").asText();
            if (signedPayload == null || signedPayload.isEmpty()) {
                throw new IllegalArgumentException("Signed payload is missing or empty");
            }
            ResponseBodyV2DecodedPayload result = verifier.verifyAndDecodeNotification(signedPayload);
            JWSTransactionDecodedPayload transaction = verifier.verifyAndDecodeTransaction(result.getData().getSignedTransactionInfo());
            JWSRenewalInfoDecodedPayload renewalInfo = verifier.verifyAndDecodeRenewalInfo(result.getData().getSignedRenewalInfo());
            System.out.println("Transaction" + transaction);
            System.out.println("Renewal Info: " + renewalInfo);
            handleNotification(result, transaction, renewalInfo);
            log.info("Successfully processed App Store notification");
        } catch (Exception e) {
            log.error("Failed to process App Store notification", e);
            throw new RuntimeException("Failed to process notification", e);
        }
    }

    private void handleNotification(ResponseBodyV2DecodedPayload notification, JWSTransactionDecodedPayload transaction, JWSRenewalInfoDecodedPayload renewalInfo) {
        String originalTransactionId = transaction.getOriginalTransactionId();

        Optional<UserSubscription> subscriptionOptional = subscriptionRepository
                .findByOriginalTransactionId(originalTransactionId);
        if (subscriptionOptional.isEmpty()) {
            log.warn("No subscription found for original transaction ID: {}", originalTransactionId);
            return;
        }
        UserSubscription subscription = subscriptionOptional.get();

        subscription.setOriginalTransactionId(originalTransactionId);
        subscription.setProductId(transaction.getProductId());
        subscription.setLastVerifiedAt(Instant.now());
        subscription.setExpirationDate(Instant.ofEpochMilli(transaction.getExpiresDate()));

        if (renewalInfo == null) {
            log.warn("No renewal info found for original transaction ID: {}", originalTransactionId);
            return;
        }
        if (renewalInfo != null) {
            subscription.setAutoRenew(renewalInfo.getAutoRenewStatus().getValue() == 1);
            if (renewalInfo.getAutoRenewStatus().getValue() == 0) subscription.setCancellationDate(Instant.now());
            else subscription.setCancellationDate(null);
        }

        NotificationTypeV2 type = notification.getNotificationType();
        Subtype subType = notification.getSubtype();
        log.info("Processing notification type: {}, subtype: {}", type, subType);

        switch (type) {
            case DID_RENEW -> {
                subscription.setStatus("ACTIVE");
                subscription.setTrial(false);
            }
            case SUBSCRIBED -> {
                subscription.setStatus("ACTIVE");
                subscription.setTrial(subType == Subtype.INITIAL_BUY);
            }
            case DID_FAIL_TO_RENEW -> subscription.setStatus("BILLING_RETRY");
            case EXPIRED, GRACE_PERIOD_EXPIRED -> {
                subscription.setStatus("EXPIRED");
                subscription.setTrial(false);
            }
            case DID_CHANGE_RENEWAL_STATUS -> // Only update isAutoRenew — status stays the same
                    subscription.setAutoRenew(renewalInfo.getAutoRenewStatus().getValue() == 1);
            case DID_CHANGE_RENEWAL_PREF -> // Optional: notify user of changed productId
                    subscription.setProductId(renewalInfo.getAutoRenewProductId());
            case REVOKE -> {
                subscription.setStatus("REVOKED");
                subscription.setTrial(false);
            }
            default -> log.warn("Unhandled notification type: {}", type);
        }

        subscriptionRepository.save(subscription);
    }
}
