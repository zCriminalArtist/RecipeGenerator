package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Dto.AppleLatestReceiptInfo;
import com.matthew.RecipeGenerator.Dto.GoogleSubscription;

public interface SubscriptionService {
    void syncAppleSubscription(Integer userId, AppleLatestReceiptInfo receipt, String isInBillingRetryPeriod);
    void syncGoogleSubscription(Integer userId, GoogleSubscription info);
}
