package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Dto.AppleLatestReceiptInfo;
import com.matthew.RecipeGenerator.Dto.GoogleSubscription;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Model.UserSubscription;

public interface SubscriptionService {
    void syncAppleSubscription(User user, AppleLatestReceiptInfo receipt, String isInBillingRetryPeriod);
    void syncGoogleSubscription(User user, GoogleSubscription info);
}
