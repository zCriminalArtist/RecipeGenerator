package com.matthew.RecipeGenerator.Service;

import com.apple.itunes.storekit.client.AppStoreServerAPIClient;
import com.apple.itunes.storekit.client.GetTransactionHistoryVersion;
import com.apple.itunes.storekit.model.*;
import com.apple.itunes.storekit.verification.SignedDataVerifier;
import com.apple.itunes.storekit.verification.VerificationException;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import com.matthew.RecipeGenerator.Repo.UserSubscriptionRepo;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class TransactionHistorySyncServiceImpl implements TransactionHistorySyncService {

    @Autowired
    private SignedDataVerifier verifier;

    @Autowired
    private AppStoreServerAPIClient client;

    @Autowired
    private UserSubscriptionRepo subscriptionRepository;

    @PostConstruct
    public void startupSync() {
        log.info("Performing startup sync with Apple Transaction History API...");
        syncTransactionHistory();
    }

    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    public void periodicSync() {
        log.info("Performing periodic sync with Apple Transaction History API...");
        syncTransactionHistory();
    }

    private void syncTransactionHistory() {
        try {
            List<UserSubscription> subscriptions = subscriptionRepository.findAll();

            for (UserSubscription subscription : subscriptions) {
                if (subscription.getPlatform() == null || !subscription.getPlatform().equals("ios")) {
                    continue;
                }
                String originalTransactionId = subscription.getOriginalTransactionId();

                TransactionHistoryRequest request = new TransactionHistoryRequest()
                        .productTypes(List.of(TransactionHistoryRequest.ProductType.AUTO_RENEWABLE))
                        .sort(TransactionHistoryRequest.Order.DESCENDING);

                HistoryResponse response = client.getTransactionHistory(originalTransactionId, null, request, GetTransactionHistoryVersion.V2);
                Optional.ofNullable(response.getSignedTransactions())
                        .filter(signedResponses -> !signedResponses.isEmpty())
                        .ifPresentOrElse(signedResponses -> {
                            JWSTransactionDecodedPayload latestTransaction = null;
                            try {
                                latestTransaction = verifier.verifyAndDecodeTransaction(signedResponses.get(0));
                            } catch (VerificationException e) {
                                throw new RuntimeException(e);
                            }
                            processTransaction(latestTransaction);
                            }, () -> log.warn("No signed transactions found for original transaction ID: {}", originalTransactionId));
            }
        } catch (Exception e) {
            log.error("Error during transaction history sync", e);
        }
    }

    private void processTransaction(JWSTransactionDecodedPayload transaction) {
        String originalTransactionId = transaction.getOriginalTransactionId();

        UserSubscription subscription = subscriptionRepository
                .findByOriginalTransactionId(originalTransactionId)
                .orElse(new UserSubscription());

        subscription.setOriginalTransactionId(originalTransactionId);
        subscription.setProductId(transaction.getProductId());
        subscription.setExpirationDate(Instant.ofEpochMilli(transaction.getExpiresDate()));
        subscription.setPurchaseDate(Instant.ofEpochMilli(transaction.getPurchaseDate()));
        subscription.setLatestTransactionId(transaction.getTransactionId());
        Long revocationDate = transaction.getRevocationDate();
        if (revocationDate != null) {
            subscription.setStatus("REVOKED");
        } else if (Instant.now().isAfter(Instant.ofEpochMilli(transaction.getExpiresDate()))) {
            subscription.setStatus("EXPIRED");
        } else {
            subscription.setStatus("ACTIVE");
        }
        subscription.setLastVerifiedAt(Instant.now());

        subscriptionRepository.save(subscription);
    }
}