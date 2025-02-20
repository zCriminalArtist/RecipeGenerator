package com.matthew.RecipeGenerator.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matthew.RecipeGenerator.Model.Recipe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

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

        String requestBody = "{ \"model\": \"gpt-4o-mini\", \"messages\": [ { \"role\": \"user\", \"content\": \"Generate a recipe using only the following ingredients: " + ingredients + ". Respond in the order of name, description, and instructions without emphasizing or italicizing the text.\"} ], \"max_completion_tokens\": 100 }";
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }

    @Override
    public List<Recipe> parseRecipes(String responseBody) {
        List<Recipe> recipes = new ArrayList<>();
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode choicesNode = rootNode.path("choices");

            for (JsonNode choiceNode : choicesNode) {
                String content = choiceNode.path("message").path("content").asText();
                String[] parts = content.split("\n\n");

                Recipe recipe = new Recipe();
                recipe.setName(parts[0].replace("Name: ", "").trim());
                recipe.setDescription(parts[1].replace("Description:", "").trim());
                recipe.setInstructions(parts[2].replace("Instructions:", "").replace("\n"," ").trim());
                recipes.add(recipe);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return recipes;
    }
}