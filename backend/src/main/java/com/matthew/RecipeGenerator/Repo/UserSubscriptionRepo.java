package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Model.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSubscriptionRepo extends JpaRepository<UserSubscription, Integer> {

     Optional<UserSubscription> findByOriginalTransactionId(String originalTransactionId);
     Optional<UserSubscription> findByUserAndPlatform(User user, String platform);
}
