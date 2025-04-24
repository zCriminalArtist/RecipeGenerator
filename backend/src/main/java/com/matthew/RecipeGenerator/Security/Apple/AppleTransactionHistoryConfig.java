package com.matthew.RecipeGenerator.Security.Apple;

import com.apple.itunes.storekit.client.AppStoreServerAPIClient;
import com.apple.itunes.storekit.model.Environment;
import com.apple.itunes.storekit.verification.SignedDataVerifier;
import com.matthew.RecipeGenerator.Service.AppleCertificateCacheService;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.Signed;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class AppleTransactionHistoryConfig {

    @Value("${apple.bundleId}")
    private String bundleId;

    @Value("${apple.environment}")
    private String environment;

    @Value("${apple.keyId}")
    private String keyId;

    @Value("${apple.issuerId}")
    private String issuerId;

    @Value("${apple.subscriptionKeyPath}")
    private String subscriptionKeyPath;

    @Bean
    public AppStoreServerAPIClient appStoreServerAPIClient() {
        String encodedKey = null;
        try {
            encodedKey = Files.readString(Path.of(subscriptionKeyPath));
        } catch (Exception e) {
            throw new RuntimeException("Failed to read the private key file", e);
        }
        return new AppStoreServerAPIClient(encodedKey, keyId, issuerId, bundleId, Environment.valueOf(environment));
    }
}