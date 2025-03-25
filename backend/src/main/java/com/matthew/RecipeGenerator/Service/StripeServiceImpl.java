package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            paramsBuilder.setTrialEnd((System.currentTimeMillis() / 1000L) + 60);
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

    public Map<String, String> restartSubscription(User user) throws Exception {
        Stripe.apiKey = this.apiKey;
        if (user.getSubscriptionStatus().equals("canceled_pending")) {
            Subscription subscription = retrieveSubscription(user.getStripeCustomerId());
            SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
                    .setCancelAtPeriodEnd(false)
                    .build();
            subscription.update(params);
            user.setSubscriptionStatus("active");
            return null;
        } else if (user.getSubscriptionStatus().equals("canceled")) {
            return issuePaymentIntent(user);
        }
        return null;
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
    public Map<String, String> issuePaymentIntent(User user) throws Exception {
        Stripe.apiKey = this.apiKey;
        Subscription subscription = retrieveSubscription(user.getStripeCustomerId());
        Map<String, String> response = new HashMap<>();
        if (subscription == null) {
            createSubscription(user.getStripeCustomerId(), "price_1R0TNnLEmXBb6SRmWfHWlVzN", false);
            subscription = retrieveSubscription(user.getStripeCustomerId());
            System.out.println("Subscription created");
        }
        if (subscription.getTrialEnd() != null &&
                subscription.getTrialEnd() < System.currentTimeMillis() / 1000L) {
            String latestInvoiceId = subscription.getLatestInvoice();
            if (latestInvoiceId == null) {
                throw new Exception("No invoice found for this subscription.");
            }

            Invoice invoice = Invoice.retrieve(latestInvoiceId);
            if (invoice == null) {
                throw new Exception("No invoice found for this subscription.");
            }

            if (!invoice.getStatus().equals("paid")) {
                if (invoice.getStatus().equals("draft")) {
                    invoice = invoice.finalizeInvoice();
                }

                if (invoice.getPaymentIntent() == null) {
                    InvoicePayParams payParams = InvoicePayParams.builder().build();
                    invoice.pay(payParams);
                }

                PaymentIntent paymentIntent = PaymentIntent.retrieve(invoice.getPaymentIntent());
                paymentIntent.setSetupFutureUsage(String.valueOf(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION));

                response.put("customerId", user.getStripeCustomerId());
                response.put("paymentIntentId", paymentIntent.getId());
                response.put("paymentIntentClientSecret", paymentIntent.getClientSecret());
                response.put("status", paymentIntent.getStatus());

            }
        }
        return response;
    }
}