package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;

public interface PasswordResetService {
    void sendResetEmail(User user);
    String generateRandom6CharToken();
    boolean validateToken(String token);
    void resetPassword(String token, String newPassword);
}