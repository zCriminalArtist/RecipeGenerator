package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;

import java.util.Map;

public interface StripeService {
    Customer createCustomer(User user) throws StripeException;
    Customer retrieveCustomer(String customerId) throws StripeException;
    Map<String, String> restartSubscription(User user) throws Exception;
    Subscription createSubscription(String customerId, String priceId, boolean trial) throws StripeException;
    void cancelSubscription(String subscriptionId) throws StripeException;
    Subscription retrieveSubscription(String customerId) throws StripeException;
    Map<String, String> issuePaymentIntent(User user) throws Exception;
}
