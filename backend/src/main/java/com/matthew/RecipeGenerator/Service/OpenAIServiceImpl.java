package com.matthew.RecipeGenerator.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matthew.RecipeGenerator.Model.Ingredient;
import com.matthew.RecipeGenerator.Model.Recipe;
import com.matthew.RecipeGenerator.Model.RecipeIngredient;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    public JsonNode generateRecipe(String ingredients) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = "Given these ingredients: " + ingredients
                + ". Return a valid JSON array with up to one recipe object, containing:"
                + " name, description, instructions, and an 'ingredients' array."
                + " Each 'ingredients' entry must have ingredientName, quantity (decimal) and unit (cups, grams, etc.)."
                + " No code fences or additional text are allowed. Only the JSON array should be returned.";

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_completion_tokens", 400
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                apiUrl,
                entity,
                Map.class
        );

        String content = (String) ((Map)((Map)((List) response.getBody().get("choices")).get(0)).get("message")).get("content");
        System.out.println(content);
        try {
            return new ObjectMapper().readTree(content);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid JSON from AI");
        }
    }

    @Override
    public List<Recipe> parseRecipes(JsonNode aiResponse) {
        List<Recipe> recipes = new ArrayList<>();
        try {
            if (aiResponse.isArray()) {
                for (JsonNode recipeNode : aiResponse) {
                    Recipe recipe = new Recipe();
                    recipe.setName(recipeNode.get("name").asText(""));
                    recipe.setDescription(recipeNode.get("description").asText(""));
                    recipe.setInstructions(recipeNode.get("instructions").asText(""));

                    JsonNode ingredientsArray = recipeNode.get("ingredients");
                    if (ingredientsArray != null && ingredientsArray.isArray()) {
                        for (JsonNode ingredientNode : ingredientsArray) {
                            String name = ingredientNode.get("ingredientName").asText("");
                            String quantity = ingredientNode.get("quantity").asText("");
                            String unit = ingredientNode.get("unit").asText("");
                        }
                    }
                    recipes.add(recipe);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return recipes;
    }
}