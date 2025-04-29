package com.matthew.RecipeGenerator.Controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class DeepLinkFallbackController {

    @GetMapping("/verify-email")
    public String handleVerifyEmail(@RequestParam(required = false) String token,
                                    Model model,
                                    HttpServletRequest request) {

        // Check if the request is from a mobile app
        String userAgent = request.getHeader("User-Agent");
        boolean isMobileApp = userAgent != null &&
                (userAgent.contains("IngrediGo") || request.getHeader("X-IngrediGo-App") != null);

        if (isMobileApp) {
            // For mobile app requests, return JSON response
            return "forward:/api/auth/verify-email";
        }

        // For web browser requests, show the fallback page
        model.addAttribute("token", token);
        model.addAttribute("appUrl", "ingredigo://verify-email?token=" + token);
        model.addAttribute("playStoreUrl", "https://play.google.com/store/apps/details?id=me.zcriminalartist.recipegenerator");
        model.addAttribute("appStoreUrl", "https://apps.apple.com/app/id[YOUR_APP_STORE_ID]");

        return "verify-email-fallback";
    }
}