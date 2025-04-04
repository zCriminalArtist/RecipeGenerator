package com.matthew.RecipeGenerator.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Service.OpenAIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;

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

    public String generateRecipe(String ingredients) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + apiKey);
        headers.add("Content-Type", "application/json");

        String prompt = "Given the following ingredients: " + ingredients
                + ". Please respond only with a valid JSON array of up to two objects, "
                + "where each object contains the fields: name, description, and instructions. "
                + "No code fences or additional text are allowed. Only the JSON array should be returned.";

        String requestBody = """
    {
      "model": "gpt-4o-mini",
      "messages": [
        {"role": "user", "content": "%s"}
      ],
      "max_completion_tokens": 400
    }
    """.formatted(prompt);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
        );
        System.out.println("Response: " + response.getBody());
        return response.getBody();
    }

    @Override
    public List<Recipe> parseRecipes(String responseBody) {
        List<Recipe> recipes = new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            // Retrieve the 'content' string from the response
            String contentString = root.path("choices").get(0).path("message").path("content").asText("");
            // Parse the 'content' string as JSON
            JsonNode arrayNode = mapper.readTree(contentString);
            if (arrayNode.isArray()) {
                for (JsonNode node : arrayNode) {
                    Recipe recipe = new Recipe();
                    recipe.setName(node.get("name").asText(""));
                    recipe.setDescription(node.get("description").asText(""));
                    recipe.setInstructions(node.get("instructions").asText(""));
                    recipes.add(recipe);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return recipes;
    }
}