package com.matthew.RecipeGenerator.Service;


import com.matthew.RecipeGenerator.Model.User;

import java.util.List;

public interface UserService {

    List<User> getAllUsers();

    User getUserByUID(int id);

    void deleteUserById(int id);

    User updateUserById(int id, User updatedUser);

}
