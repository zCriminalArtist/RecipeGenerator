package com.matthew.RecipeGenerator.Security.Apple;

import com.apple.itunes.storekit.model.Environment;
import com.apple.itunes.storekit.verification.SignedDataVerifier;
import com.matthew.RecipeGenerator.Service.AppleCertificateCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.Signed;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class AppleNotificationConfig {

    @Value("${apple.bundleId}")
    private String bundleId;

    @Value("${apple.environment}")
    private String environment;

    @Autowired
    private AppleCertificateCacheService certificateCacheService;

    @Bean
    public SignedDataVerifier notificationVerifier() {
        Environment env = Environment.valueOf(environment);
        Long appAppleId = null;
        boolean onlineChecks = true;

        return new SignedDataVerifier(certificateCacheService.getCachedCertificates(), bundleId, appAppleId, env, onlineChecks);
    }
}