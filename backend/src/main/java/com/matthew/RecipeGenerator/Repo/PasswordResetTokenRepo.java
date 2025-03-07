package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.PasswordResetToken;
import com.matthew.RecipeGenerator.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
}

