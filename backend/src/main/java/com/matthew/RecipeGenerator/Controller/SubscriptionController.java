package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import com.matthew.RecipeGenerator.Service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.SubscriptionItemListParams;
import com.stripe.param.SubscriptionListParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/subscription/status")
    public ResponseEntity<Map<String, String>> checkSubscriptionStatus(@AuthenticationPrincipal(errorOnInvalidType=true) User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        String status = user.getSubscriptionStatus();
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
                subscriptionData.put("subscribedOn", new SimpleDateFormat("MM/dd/yyyy").format(new Date(subscription.getStartDate() * 1000)));
                subscriptionData.put("nextPaymentDate", new SimpleDateFormat("MM/dd/yyyy").format(new Date(subscription.getCurrentPeriodEnd() * 1000)));
                subscriptionData.put("price", item.getPrice().getUnitAmountDecimal().toString());

                if (subscription.getTrialEnd() != null && new Date(subscription.getTrialEnd() * 1000).after(new Date()))
                    subscriptionData.put("trialEndsOn", new SimpleDateFormat("MM/dd/yyyy").format(new Date(subscription.getTrialEnd() * 1000)));
                response.add(subscriptionData);
            }
        }

        return ResponseEntity.ok(response);
    }
}