package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.SetupIntent;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionCollection;
import com.stripe.model.checkout.Session;
import com.stripe.param.*;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.api.key}")
    private String apiKey;

    public StripeServiceImpl() {
        Stripe.apiKey = this.apiKey;
    }

    @Override
    public Customer createCustomer(User user) throws StripeException {
        Stripe.apiKey = this.apiKey;
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getFirstName() + " " + user.getLastName())
                .build();
        return Customer.create(params);
    }

    @Override
    public Customer retrieveCustomer(String customerId) throws StripeException {
        Stripe.apiKey = this.apiKey;
        return Customer.retrieve(customerId);
    }

    @Override
    public Subscription createSubscription(String customerId, String priceId, boolean trial) throws StripeException {
        Stripe.apiKey = this.apiKey;
        SubscriptionCreateParams.Builder paramsBuilder = SubscriptionCreateParams.builder()
                .setCustomer(customerId)
                .addItem(
                        SubscriptionCreateParams.Item.builder()
                                .setPrice(priceId)
                                .build()
                )
//                .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
                .setDescription("AI Recipe Generator Subscription");

        if (trial) {
            paramsBuilder.setTrialEnd((System.currentTimeMillis() / 1000L) + 30);
        }

        SubscriptionCreateParams params = paramsBuilder.build();
        return Subscription.create(params);
    }

    @Override
    public void cancelSubscription(String subscriptionId) throws StripeException {
        Stripe.apiKey = this.apiKey;
        Subscription subscription = Subscription.retrieve(subscriptionId);
        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
                .setCancelAtPeriodEnd(true) // Allow access until end of billing period
                .build();

        subscription.update(params);
    }

    @Override
    public Subscription retrieveSubscription(String customerId) throws StripeException {
        Stripe.apiKey = this.apiKey;
        List<Subscription> subscriptions = Subscription.list(SubscriptionListParams.builder()
                .setCustomer(customerId)
                .addAllExpand(java.util.List.of("data.latest_invoice.payment_intent"))
                .build()).getData();
        return subscriptions.isEmpty() ? null : subscriptions.get(subscriptions.size() - 1);
    }

    @Override
    public Session createCheckoutSession(String customerId, String priceId) throws StripeException {
        Stripe.apiKey = this.apiKey;
        return Session.create(
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                        .setCustomer(customerId)
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setPrice(priceId)
                                        .setQuantity(1L)
                                        .build()
                        )
                        .setSuccessUrl("http://localhost:3000/success")
                        .setCancelUrl("http://localhost:3000/cancel")
                        .build()
        );
    }

    @Override
    public String createSetupIntent(String customerId) throws StripeException {
        Stripe.apiKey = this.apiKey;

        SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                .addPaymentMethodType("card")
                .setCustomer(customerId)
                .setUsage(SetupIntentCreateParams.Usage.OFF_SESSION)
                .build();

        SetupIntent setupIntent = SetupIntent.create(params);

        return setupIntent.getClientSecret();
    }
}