package com.matthew.RecipeGenerator.Service;

import java.io.InputStream;
import java.util.Set;

public interface AppleCertificateCacheService {

    void fetchAndCacheCertificates();
    Set<InputStream> getCachedCertificates();

}
