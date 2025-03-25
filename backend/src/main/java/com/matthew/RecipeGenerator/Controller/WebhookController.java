package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import com.stripe.param.SubscriptionUpdateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    @Autowired
    private UserRepo userRepository;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            StripeObject stripeObject = event.getData().getObject();

            if ("setup_intent.succeeded".equals(event.getType())) {
                SetupIntent setupIntent = (SetupIntent) stripeObject;
                String customerId = setupIntent.getCustomer();
                String paymentMethodId = setupIntent.getPaymentMethod();
                Optional<User> userOptional = userRepository.findByStripeCustomerId(customerId);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    Subscription.retrieve(user.getStripeSubscriptionId()).update(SubscriptionUpdateParams.builder().setDefaultPaymentMethod(paymentMethodId).build());
                }
            } else if ("customer.subscription.deleted".equals(event.getType())) {
                System.out.println("Subscription deleted");
                Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
                if (subscription != null) {
                    String customerId = subscription.getCustomer();
                    Optional<User> userOptional = userRepository.findByStripeCustomerId(customerId);
                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        user.setSubscriptionStatus("canceled");
                        userRepository.save(user);
                    }
                }
            } else if ("invoice.payment_succeeded".equals(event.getType())) {
                System.out.println("Subscription succeeded");
                Invoice invoice = (Invoice) stripeObject;
                String stripeCustomerId = invoice.getCustomer();

                Optional<User> optionalUser = userRepository.findByStripeCustomerId(stripeCustomerId);
                if (optionalUser.isPresent()) {
                    User user = optionalUser.get();
                    if (!(user.getSubscriptionStatus().equals("trialing") || user.getSubscriptionStatus().equals("active"))) {
                        user.setSubscriptionStatus("active");
                        userRepository.save(user);
                    }
                }
            } else if ("customer.subscription.updated".equals(event.getType())) {
                System.out.println("Subscription updated");
                Subscription subscription = (Subscription) stripeObject;
                String stripeCustomerId = subscription.getCustomer();
                Optional<User> userOptional = userRepository.findByStripeCustomerId(stripeCustomerId);
                if (userOptional.isPresent()) {
                    System.out.println(subscription.getStatus());
                    User user = userOptional.get();
                    if ("past_due".equals(subscription.getStatus())) {
                        user.setSubscriptionStatus("past_due");
                        userRepository.save(user);
                    } else if ("trialing".equals(user.getSubscriptionStatus())) {
                        Long trialEnd = subscription.getTrialEnd();
                        if (trialEnd != null) {
                            LocalDateTime trialEndTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(trialEnd), ZoneId.systemDefault());
                            LocalDateTime currentTime = LocalDateTime.now();
                            if (trialEndTime.getYear() == currentTime.getYear() &&
                                    trialEndTime.getDayOfYear() == currentTime.getDayOfYear() &&
                                    trialEndTime.getHour() == currentTime.getHour()) {
                                System.out.println("Trial end time is within the same hour as the current system time");
                                user.setSubscriptionStatus("trial_expired");
                                userRepository.save(user);
                            }
                        }
                    }
                }
            }

        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (StripeException e) {
            throw new RuntimeException(e);
        }

        return ResponseEntity.ok("Event received");
    }
}