package com.matthew.RecipeGenerator.Config;

import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> containerCustomizer() {
        return container -> {
            MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
            // Ensure apple-app-site-association is served as application/json
            mappings.add("apple-app-site-association", "application/json");
            container.setMimeMappings(mappings);
        };
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/apple-app-site-association")
                .addResourceLocations("classpath:/static/apple-app-site-association")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));

        registry.addResourceHandler("/.well-known/apple-app-site-association")
                .addResourceLocations("classpath:/static/.well-known/apple-app-site-association")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));

        registry.addResourceHandler("/.well-known/assetlinks.json")
                .addResourceLocations("classpath:/static/.well-known/assetlinks.json")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));
    }
}