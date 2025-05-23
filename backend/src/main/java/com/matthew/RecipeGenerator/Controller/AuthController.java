package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Dto.UserLoginRequest;
import com.matthew.RecipeGenerator.Dto.UserRegistrationRequest;
import com.matthew.RecipeGenerator.Model.PasswordResetToken;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import com.matthew.RecipeGenerator.Repo.PasswordResetTokenRepo;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import com.matthew.RecipeGenerator.Repo.UserSubscriptionRepo;
import com.matthew.RecipeGenerator.Security.Jwt.JwtUtil;
import com.matthew.RecipeGenerator.Service.EmailVerificationService;
import com.matthew.RecipeGenerator.Service.PasswordResetService;
import com.matthew.RecipeGenerator.Service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.ApiResource;
import com.stripe.param.EphemeralKeyCreateParams;
import com.stripe.param.InvoicePayParams;
import com.stripe.param.PaymentIntentCreateParams;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Flow;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final PasswordResetTokenRepo tokenRepository;

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        try {
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Password reset successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/request-reset")
    public ResponseEntity<String> requestResetPassword(@RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Optional<PasswordResetToken> existingToken = tokenRepository.findByUser(user);

            if (existingToken.isPresent() && existingToken.get().getExpiryDate().isAfter(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Password reset email already sent");
            } else {
                passwordResetService.sendResetEmail(user);
            }

            return ResponseEntity.ok("Password reset email sent");
        }
        return ResponseEntity.badRequest().body("Email not found");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        User user = emailVerificationService.verifyEmailAndGetUser(token);
        if (user != null) {
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user, null, user.getAuthorities());
            String jwt = jwtUtil.generateToken(authentication);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Email verified successfully");
            response.put("token", jwt);
            response.put("verified", true);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Invalid verification token");
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestParam String token) {
        try {
            String newToken = jwtUtil.refreshToken(token);
            return ResponseEntity.ok(newToken);
        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Token has expired and cannot be refreshed");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already associated with an account");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(false);

        userRepository.save(user);
        emailVerificationService.sendVerificationEmail(user);

        return ResponseEntity.ok("User registered successfully. Please verify your email.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Invalid email or password");
        }

        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Verify your email to continue");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken(authentication);

        if (user.getSubscription() == null) {
            return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(Collections.singletonMap("token", token));
        }
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }
}