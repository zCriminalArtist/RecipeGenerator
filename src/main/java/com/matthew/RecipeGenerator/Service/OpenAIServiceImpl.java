package com.matthew.RecipeGenerator.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

@Service
public class OpenAIServiceImpl implements OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public OpenAIServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String generateRecipe(String ingredients) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        String requestBody = "{ \"model\": \"gpt-4o-mini\", \"messages\": [ { \"role\": \"user\", \"content\": \"Generate a recipe using only the following ingredients: " + ingredients + ". Respond in the order of name, description, and instructions.\"} ], \"max_completion_tokens\": 100 }";
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }
}