package com.matthew.RecipeGenerator.Service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class AppleCertificateCacheServiceImpl implements AppleCertificateCacheService {

    private static final String APPLE_ROOT_CERT_URL = "https://www.apple.com/certificateauthority/AppleRootCA-G3.cer";
    private static final String APPLE_INC_ROOT_CERT_URL = "https://www.apple.com/appleca/AppleIncRootCertificate.cer";

    private final Set<InputStream> cachedCertificates = new HashSet<>();

    @PostConstruct
    public void initialize() {
        fetchAndCacheCertificates();
    }

    public void fetchAndCacheCertificates() {
        try {
            cachedCertificates.add(downloadCertificate(APPLE_ROOT_CERT_URL));
            cachedCertificates.add(downloadCertificate(APPLE_INC_ROOT_CERT_URL));
            log.info("Successfully fetched and cached Apple root certificates.");
        } catch (Exception e) {
            log.error("Failed to fetch Apple root certificates", e);
            throw new RuntimeException("Failed to fetch Apple root certificates", e);
        }
    }

    public Set<InputStream> getCachedCertificates() {
        return cachedCertificates;
    }

    private InputStream downloadCertificate(String certUrl) throws Exception {
        URL url = new URL(certUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setDoInput(true);
        connection.connect();

        if (connection.getResponseCode() != 200) {
            throw new RuntimeException("Failed to download certificate from: " + certUrl);
        }

        return connection.getInputStream();
    }
}