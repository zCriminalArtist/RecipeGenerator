package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.RefreshToken;
import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.RefreshTokenRepo;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {
    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenExpiration;

    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    public RefreshToken createRefreshToken(User user) {
        refreshTokenRepo.findByUser(user).ifPresent(refreshTokenRepo::delete);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpiration));

        return refreshTokenRepo.save(refreshToken);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepo.findByToken(token);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepo.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new sign-in request");
        }
        return token;
    }

    @Override
    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepo.deleteByUser(user);
    }

    @Override
    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepo.deleteByToken(token);
    }
}