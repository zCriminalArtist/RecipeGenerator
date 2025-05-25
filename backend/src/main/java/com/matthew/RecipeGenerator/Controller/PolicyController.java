package com.matthew.RecipeGenerator.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PolicyController {

    @GetMapping("/terms-of-service")
    public String getTermsOfService() {
        return "terms-of-service";
    }
}