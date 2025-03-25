package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Dto.UserLoginRequest;
import com.matthew.RecipeGenerator.Dto.UserRegistrationRequest;
import com.matthew.RecipeGenerator.Model.PasswordResetToken;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.PasswordResetTokenRepo;
import com.matthew.RecipeGenerator.Repo.UserRepo;
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
    private final StripeService stripeService;

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
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        boolean isVerified = emailVerificationService.verifyEmail(token);
        if (isVerified) {
            return ResponseEntity.ok("Email verified successfully");
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
            return ResponseEntity.badRequest().body("Username is already taken.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already associated with an account.");
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

        try {
            Customer stripeCustomer = stripeService.createCustomer(user);
            user.setStripeCustomerId(stripeCustomer.getId());
            Subscription subscription = stripeService.createSubscription(stripeCustomer.getId(), "price_1R0TNnLEmXBb6SRmWfHWlVzN", true);
            user.setStripeSubscriptionId(subscription.getId());
            user.setSubscriptionStatus("trialing");
            userRepository.save(user);
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating Stripe customer: " + e.getMessage());
        }

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

//        String status = user.getSubscriptionStatus();
//        switch (status) {
//            case "active":
//                break;
//            case "trialing":
//                break;
//            case "past_due":
//                try {
//                    Subscription subscription = stripeService.retrieveSubscription(user.getStripeCustomerId());
//                    if (subscription == null) {
//                        stripeService.createSubscription(user.getStripeCustomerId(), "price_1R0TNnLEmXBb6SRmWfHWlVzN", false);
//                        subscription = stripeService.retrieveSubscription(user.getStripeCustomerId());
//                        System.out.println("Subscription created");
//                    }
//                    if (subscription.getTrialEnd() != null &&
//                            subscription.getTrialEnd() < System.currentTimeMillis() / 1000L) {
//                        String latestInvoiceId = subscription.getLatestInvoice();
//                        if (latestInvoiceId == null) {
//                            throw new Exception("No invoice found for this subscription.");
//                        }
//
//                        Invoice invoice = Invoice.retrieve(latestInvoiceId);
//                        if (invoice == null) {
//                            throw new Exception("No invoice found for this subscription.");
//                        }
//
//                        if (!invoice.getStatus().equals("paid")) {
//                            if (invoice.getStatus().equals("draft")) {
//                                invoice = invoice.finalizeInvoice();
//                            }
//
//                            if (invoice.getPaymentIntent() == null) {
//                                InvoicePayParams payParams = InvoicePayParams.builder().build();
//                                invoice.pay(payParams);
//                            }
//
//                            PaymentIntent paymentIntent = PaymentIntent.retrieve(invoice.getPaymentIntent());
//                            paymentIntent.setSetupFutureUsage(String.valueOf(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION));
//
//                            Map<String, String> response = new HashMap<>();
//                            response.put("customerId", user.getStripeCustomerId());
//                            response.put("paymentIntentId", paymentIntent.getId());
//                            response.put("paymentIntentClientSecret", paymentIntent.getClientSecret());
//                            response.put("status", paymentIntent.getStatus());
//
//
//                            return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(response);
//                        }
//                    }
//                } catch (StripeException e) {
//                    return ResponseEntity.status(HttpServletResponse.SC_INTERNAL_SERVER_ERROR).body("Error retrieving subscription: " + e.getMessage());
//                } catch (Exception e) {
//                    throw new RuntimeException(e);
//                }
//                break;
//            case "canceled":
//                break;
//            case "canceled_pending":
//                break;
//            case "trial_expired":
//                try {
//                    Subscription subscription = stripeService.retrieveSubscription(user.getStripeCustomerId());
//                    if (subscription == null) {
//                        stripeService.createSubscription(user.getStripeCustomerId(), "price_1R0TNnLEmXBb6SRmWfHWlVzN", false);
//                        subscription = stripeService.retrieveSubscription(user.getStripeCustomerId());
//                        System.out.println("Subscription created");
//                    }
//                    if (subscription.getTrialEnd() != null &&
//                            subscription.getTrialEnd() < System.currentTimeMillis() / 1000L) {
//                        String latestInvoiceId = subscription.getLatestInvoice();
//                        if (latestInvoiceId == null) {
//                            throw new Exception("No invoice found for this subscription.");
//                        }
//
//                        Invoice invoice = Invoice.retrieve(latestInvoiceId);
//                        if (invoice == null) {
//                            throw new Exception("No invoice found for this subscription.");
//                        }
//
//                        if (!invoice.getStatus().equals("paid")) {
//                            if (invoice.getStatus().equals("draft")) {
//                                invoice = invoice.finalizeInvoice();
//                            }
//
//                            if (invoice.getPaymentIntent() == null) {
//                                InvoicePayParams payParams = InvoicePayParams.builder().build();
//                                invoice.pay(payParams);
//                            }
//
//                            PaymentIntent paymentIntent = PaymentIntent.retrieve(invoice.getPaymentIntent());
//                            paymentIntent.setSetupFutureUsage(String.valueOf(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION));
//
//                            Map<String, String> response = new HashMap<>();
//                            response.put("customerId", user.getStripeCustomerId());
//                            response.put("paymentIntentId", paymentIntent.getId());
//                            response.put("paymentIntentClientSecret", paymentIntent.getClientSecret());
//                            response.put("status", paymentIntent.getStatus());
//
//
//                            return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(response);
//                        }
//                    }
//                } catch (StripeException e) {
//                    return ResponseEntity.status(HttpServletResponse.SC_INTERNAL_SERVER_ERROR).body("Error retrieving subscription: " + e.getMessage());
//                } catch (Exception e) {
//                    throw new RuntimeException(e);
//                }
//                break;
//            default:
//                break;
//        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken(authentication);
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }
}