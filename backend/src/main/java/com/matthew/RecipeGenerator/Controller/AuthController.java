package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Dto.TokenRefreshRequest;
import com.matthew.RecipeGenerator.Dto.TokenRefreshResponse;
import com.matthew.RecipeGenerator.Dto.UserLoginRequest;
import com.matthew.RecipeGenerator.Dto.UserRegistrationRequest;
import com.matthew.RecipeGenerator.Model.PasswordResetToken;
import com.matthew.RecipeGenerator.Model.RefreshToken;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.PasswordResetTokenRepo;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import com.matthew.RecipeGenerator.Security.Jwt.JwtUtil;
import com.matthew.RecipeGenerator.Service.EmailVerificationService;
import com.matthew.RecipeGenerator.Service.PasswordResetService;
import com.matthew.RecipeGenerator.Service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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
    private final RefreshTokenService refreshTokenService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("subscribed", user.getSubscription() != null);

        if (user.getSubscription() != null) {
            response.put("subscriptionStatus", user.getSubscription().getStatus());
        }

        return ResponseEntity.ok(response);
    }

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
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("refreshToken", refreshToken.getToken());
            response.put("message", "Email verified successfully");

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired verification token");
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(token -> {
                    User user = token.getUser();
                    refreshTokenService.deleteByToken(requestRefreshToken);
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    String accessToken = jwtUtil.generateToken(authentication);

                    return ResponseEntity.ok(new TokenRefreshResponse(accessToken, newRefreshToken.getToken()));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
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

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("refreshToken", refreshToken.getToken());

        if (user.getSubscription() == null) {
            return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody String refreshToken) {
        try {
            refreshTokenService.findByToken(refreshToken)
                    .ifPresent(token -> refreshTokenService.deleteByToken(refreshToken));

            Map<String, Boolean> response = new HashMap<>();
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error during sign out: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}