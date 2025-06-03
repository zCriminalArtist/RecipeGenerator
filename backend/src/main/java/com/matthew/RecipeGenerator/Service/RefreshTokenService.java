package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.RefreshToken;
import com.matthew.RecipeGenerator.Model.User;

import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    Optional<RefreshToken> findByToken(String token);
    RefreshToken verifyExpiration(RefreshToken token);
    void deleteByUser(User user);
    void deleteByToken(String token);
}
