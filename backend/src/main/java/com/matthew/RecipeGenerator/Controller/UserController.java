package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

import com.matthew.RecipeGenerator.Model.User;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/status")
    public ResponseEntity<?> getUserStatus(@AuthenticationPrincipal(errorOnInvalidType = true) User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No authenticated user found");
        }
        Map<String, Object> userDetails = Map.of(
                "id", user.getUserId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "role", user.getRole(),
                "enabled", user.isEnabled(),
                "createdAt", user.getUserCreatedAt(),
                "hasSubscription", user.getSubscription() != null,
                "subscriptionStatus", user.getSubscription() != null ? user.getSubscription().getStatus() : null
        );
        return ResponseEntity.ok(userDetails);
    }
}
