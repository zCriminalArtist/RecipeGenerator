package com.matthew.RecipeGenerator.Service;

import com.matthew.RecipeGenerator.Model.User;
import com.matthew.RecipeGenerator.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @Autowired
    UserRepo userRepo;

    @Override
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @Override
    public User getUserByUID(int id) {
        return userRepo.findById(id).orElse(null);
    }

    @Override
    public void deleteUserById(int id) {
        userRepo.deleteById(id);
    }

    @Override
    public User updateUserById(int id, User nUser) {
        User otherUser = userRepo.findById(id).orElse(null);
        if(otherUser != null) {
            userRepo.save(nUser);
            return getUserByUID(id);
        }
        return null;
    }
}
