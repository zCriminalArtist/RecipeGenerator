package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Dto.AppleLatestReceiptInfo;
import com.matthew.RecipeGenerator.Dto.GoogleSubscription;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import com.matthew.RecipeGenerator.Repo.UserSubscriptionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    @Autowired
    private UserSubscriptionRepo subscriptionRepository;

    public void syncAppleSubscription(Integer userId, AppleLatestReceiptInfo receipt, String isInBillingRetryPeriod) {
        Instant purchaseDate = Instant.ofEpochMilli(Long.parseLong(receipt.getPurchaseDateMs()));
        Instant expirationDate = Instant.ofEpochMilli(Long.parseLong(receipt.getExpiresDateMs()));
        Instant cancellationDate = receipt.getCancellationDate() != null
                ? Instant.parse(receipt.getCancellationDate()) : null;

        String originalTransactionId = receipt.getOriginalTransactionId();

        Optional<UserSubscription> existing = subscriptionRepository.findByOriginalTransactionId(originalTransactionId);
        UserSubscription subscription = existing.orElseGet(UserSubscription::new);

        subscription.setUserId(userId);
        subscription.setPlatform("ios");
        subscription.setProductId(receipt.getProductId());
        subscription.setOriginalTransactionId(originalTransactionId);
        subscription.setLatestTransactionId(receipt.getTransactionId());
        subscription.setPurchaseDate(purchaseDate);
        subscription.setExpirationDate(expirationDate);
        subscription.setStatus("ACTIVE");
        subscription.setCancellationDate(cancellationDate);
        subscription.setTrial("true".equals(receipt.getIsTrialPeriod()));
        subscription.setAutoRenew(!"1".equals(isInBillingRetryPeriod));
        subscription.setLastVerifiedAt(Instant.now());

        subscriptionRepository.save(subscription);
    }

    public void syncGoogleSubscription(Integer userId, GoogleSubscription info) {
        Instant purchaseDate = Instant.ofEpochMilli(Long.parseLong(info.getStartTimeMillis()));
        Instant expirationDate = Instant.ofEpochMilli(Long.parseLong(info.getExpiryTimeMillis()));

        Optional<UserSubscription> existing = subscriptionRepository
                .findByUserIdAndPlatform(userId, "android");

        UserSubscription subscription = existing.orElseGet(UserSubscription::new);

        subscription.setUserId(userId);
        subscription.setPlatform("android");
        subscription.setProductId(info.getProductId());
        subscription.setOriginalTransactionId(info.getPurchaseToken());
        subscription.setLatestTransactionId(info.getOrderId());
        subscription.setPurchaseDate(purchaseDate);
        subscription.setExpirationDate(expirationDate);
        subscription.setCancellationDate(null); // handle server-side webhooks for real cancels
        subscription.setTrial(info.isTrial());
        subscription.setAutoRenew(info.isAutoRenewing());
        subscription.setLastVerifiedAt(Instant.now());

        subscriptionRepository.save(subscription);
    }
}
