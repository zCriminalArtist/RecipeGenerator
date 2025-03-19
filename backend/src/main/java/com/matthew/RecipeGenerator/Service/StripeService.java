package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;

public interface StripeService {
    Customer createCustomer(User user) throws StripeException;
    Customer retrieveCustomer(String customerId) throws StripeException;
    Subscription createSubscription(String customerId, String priceId, boolean trial) throws StripeException;
    void cancelSubscription(String subscriptionId) throws StripeException;
    Subscription retrieveSubscription(String customerId) throws StripeException;
    Session createCheckoutSession(String customerId, String priceId) throws StripeException;
    String createSetupIntent(String customerId) throws StripeException;
}
