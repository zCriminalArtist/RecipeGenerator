package com.matthew.RecipeGenerator.Repo;

import com.matthew.RecipeGenerator.Model.RefreshToken;
import com.matthew.RecipeGenerator.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
    void deleteByUser(User user);
    @Transactional
    void deleteByToken(String token);
}