package com.matthew.RecipeGenerator.Verifier;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.androidpublisher.AndroidPublisher;
import com.google.api.services.androidpublisher.model.SubscriptionPurchase;
import com.matthew.RecipeGenerator.Dto.GoogleSubscription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.util.List;

@Component
@Slf4j
public class GooglePlayVerifier {

    private static final String APPLICATION_NAME = "YourApp";
    private static final String SERVICE_ACCOUNT_JSON_PATH = "/path/to/service-account.json";

    private AndroidPublisher androidPublisher;

    public GooglePlayVerifier() {
//        try {
//            GoogleCredential credential = GoogleCredential
//                    .fromStream(new FileInputStream(SERVICE_ACCOUNT_JSON_PATH))
//                    .createScoped(List.of("https://www.googleapis.com/auth/androidpublisher"));
//
//            androidPublisher = new AndroidPublisher.Builder(
//                    credential.getTransport(),
//                    credential.getJsonFactory(),
//                    credential)
//                    .setApplicationName(APPLICATION_NAME)
//                    .build();
//        } catch (Exception e) {
//            log.error("Failed to initialize Google Play API", e);
//        }
    }

    public GoogleSubscription verifyPurchase(String packageName, String productId, String purchaseToken) {
        try {
            SubscriptionPurchase purchase = androidPublisher.purchases().subscriptions()
                    .get(packageName, productId, purchaseToken)
                    .execute();

            return GoogleSubscription.from(purchase, productId, purchaseToken);
        } catch (Exception e) {
            log.error("Google Play verification failed", e);
            return null;
        }
    }
}
