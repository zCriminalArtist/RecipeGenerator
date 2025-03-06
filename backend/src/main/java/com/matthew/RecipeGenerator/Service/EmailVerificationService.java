package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;

public interface EmailVerificationService {
    public void sendVerificationEmail(User user);
    public boolean verifyEmail(String token);
}
