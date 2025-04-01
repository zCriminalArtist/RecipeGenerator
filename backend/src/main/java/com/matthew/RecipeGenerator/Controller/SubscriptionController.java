package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import com.matthew.RecipeGenerator.Service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.SetupIntentCreateParams;
import com.stripe.param.SubscriptionItemListParams;
import com.stripe.param.SubscriptionListParams;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private StripeService stripeService;

    @Autowired
    private UserRepo userRepository;

    @DeleteMapping("/cancel")
    public ResponseEntity<String> cancelSubscription(@AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        try {
            stripeService.cancelSubscription(user.getStripeSubscriptionId());
            user.setSubscriptionStatus("canceled_pending");
            userRepository.save(user);
            return ResponseEntity.ok("Subscription cancelled successfully.");
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error cancelling subscription: " + e.getMessage());
        }
    }

    @PostMapping("/restart")
    public ResponseEntity<?> restartSubscription(@AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        try {
            Map<String, String> response = stripeService.restartSubscription(user);
            if (response != null) {
                return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(response);
            }
            userRepository.save(user);
            return ResponseEntity.ok("Subscription restarted successfully.");
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error restarting subscription: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activateSubscription(@AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        try {
            Map<String, String> response = stripeService.issuePaymentIntent(user);
            if (response != null) {
                return ResponseEntity.status(HttpServletResponse.SC_PAYMENT_REQUIRED).body(response);
            }
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error activating subscription");
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error activating subscription: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Map<String, String>> createSetupIntent(@AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        try {
            SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                    .setCustomer(user.getStripeCustomerId())
                    .addPaymentMethodType("card")
                    .build();

            SetupIntent setupIntent = SetupIntent.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("customerId", user.getStripeCustomerId());
            response.put("clientSecret", setupIntent.getClientSecret());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> checkSubscriptionStatus(@AuthenticationPrincipal(errorOnInvalidType=true) User user) throws StripeException {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        String status = user.getSubscriptionStatus();
        if (status.equals("trialing")) {
            Subscription subscription = stripeService.retrieveSubscription(user.getStripeSubscriptionId());
            if (subscription.getTrialEnd() != null && new Date(subscription.getTrialEnd() * 1000).after(new Date())) {
                status = "trial_expired";
                user.setSubscriptionStatus(status);
                userRepository.save(user);
            }
        }

        return ResponseEntity.ok(Map.of("status", status));
    }

    @GetMapping("/list")
    ResponseEntity<?> viewSubscriptions(@AuthenticationPrincipal(errorOnInvalidType=true) User user) throws StripeException {
        Customer customer = stripeService.retrieveCustomer(user.getStripeCustomerId());

        if (customer == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        SubscriptionCollection subscriptions = Subscription.list(
                SubscriptionListParams.builder()
                        .setCustomer(customer.getId())
                        .build());

        List<Map<String, String>> response = new ArrayList<>();

        for (Subscription subscription : subscriptions.getData()) {
            SubscriptionItemCollection currSubscriptionItems =
                    SubscriptionItem.list(SubscriptionItemListParams.builder()
                            .setSubscription(subscription.getId())
                            .addExpand("data.price.product")
                            .build());

            for (SubscriptionItem item : currSubscriptionItems.getData()) {
                HashMap<String, String> subscriptionData = new HashMap<>();
                subscriptionData.put("subscriptionId", item.getSubscription());
                subscriptionData.put("subscriptionDescription", subscription.getDescription());
                subscriptionData.put("subscribedOn", new SimpleDateFormat("M/dd/yyyy").format(new Date(subscription.getStartDate() * 1000)));
                subscriptionData.put("nextPaymentDate", new SimpleDateFormat("M/dd/yyyy").format(new Date(subscription.getCurrentPeriodEnd() * 1000)));
                if (subscription.getDefaultPaymentMethod() != null) {
                    PaymentMethod paymentMethod = PaymentMethod.retrieve(subscription.getDefaultPaymentMethod());
                    if (paymentMethod != null) {
                        if (paymentMethod.getCard() != null) {
                            subscriptionData.put("paymentMethod", paymentMethod.getCard().getBrand().substring(0, 1).toUpperCase() + paymentMethod.getCard().getBrand().substring(1).toLowerCase() + " **** " + paymentMethod.getCard().getLast4());
                        } else {
                            subscriptionData.put("paymentMethod", "Other");
                        }
                    } else {
                        subscriptionData.put("paymentMethod", "No payment method on file");
                    }
                } else {
                    subscriptionData.put("paymentMethod", "No method on file");
                }
                BigDecimal priceDecimal = item.getPrice().getUnitAmountDecimal().movePointLeft(2);
                String formattedPrice = String.format("$%.2f / month", priceDecimal);
                subscriptionData.put("price", formattedPrice);
                String status = user.getSubscriptionStatus();
                if (status.equals("trialing")) {
                    if (subscription.getTrialEnd() != null && new Date().after(new Date(subscription.getTrialEnd() * 1000))) {
                        status = "trial_expired";
                        user.setSubscriptionStatus(status);
                        userRepository.save(user);
                    } else {
                        subscriptionData.put("trialEndsOn", new SimpleDateFormat("MM/dd/yyyy").format(new Date(subscription.getTrialEnd() * 1000)));
                    }
                }
                subscriptionData.put("status", user.getSubscriptionStatus());

//                if (subscription.getTrialEnd() != null && new Date(subscription.getTrialEnd() * 1000).after(new Date()))
//                    subscriptionData.put("trialEndsOn", new SimpleDateFormat("MM/dd/yyyy").format(new Date(subscription.getTrialEnd() * 1000)));
                response.add(subscriptionData);
            }
        }

        return ResponseEntity.ok(response);
    }
}