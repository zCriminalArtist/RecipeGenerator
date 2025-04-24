package com.matthew.RecipeGenerator.Service;

import com.apple.itunes.storekit.model.ResponseBodyV2DecodedPayload;

public interface AppleNotificationService {
    void processNotification(String jsonPayload);
}
