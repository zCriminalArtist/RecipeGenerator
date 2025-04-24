package com.matthew.RecipeGenerator.Dto;

import com.google.api.services.androidpublisher.model.SubscriptionPurchase;
import lombok.Data;

@Data
public class GoogleSubscription {
    private String productId;
    private String orderId;
    private String purchaseToken;
    private String startTimeMillis;
    private String expiryTimeMillis;
    private boolean isAutoRenewing;
    private boolean isTrial;

    public static GoogleSubscription from(SubscriptionPurchase purchase, String productId, String purchaseToken) {
        GoogleSubscription info = new GoogleSubscription();
        info.setProductId(productId);
        info.setOrderId(purchase.getOrderId());
        info.setPurchaseToken(purchaseToken);
        info.setStartTimeMillis(purchase.getStartTimeMillis().toString());
        info.setExpiryTimeMillis(purchase.getExpiryTimeMillis().toString());
        info.setAutoRenewing(purchase.getAutoRenewing() != null && purchase.getAutoRenewing());
        info.setTrial(purchase.getIntroductoryPriceInfo() != null);
        return info;
    }
}