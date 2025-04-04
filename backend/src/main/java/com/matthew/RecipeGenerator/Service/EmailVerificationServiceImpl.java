package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EmailVerificationServiceImpl implements EmailVerificationService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${BACKEND_URL}")  // Inject the frontend URL from the properties file
    private String backendUrl;


    public void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        userRepo.save(user);

        String verificationUrl = "https://" + backendUrl + "/api/auth/verify-email?token=" + token;

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("Email Verification");
        mailMessage.setText("Click the link to verify your email: " + verificationUrl);

        mailSender.send(mailMessage);
    }

    public boolean verifyEmail(String token) {
        User user = userRepo.findByVerificationToken(token).orElse(null);
        if (user != null) {
            user.setEnabled(true);
            user.setVerificationToken(null);
            userRepo.save(user);
            return true;
        }
        return false;
    }
}