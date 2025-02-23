package com.matthew.RecipeGenerator.Controller;

import com.matthew.RecipeGenerator.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import com.matthew.RecipeGenerator.Model.User;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    UserService userService;

    // Get list of all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get user by ID
    @GetMapping("/{user_id}")
    public ResponseEntity<User> getUser(@PathVariable("user_id") int id) {
        User retrievedUser = userService.getUserByUID(id);
        return retrievedUser == null
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
                : ResponseEntity.status(HttpStatus.OK).body(retrievedUser);
    }

    // Update a user's username and password
    @PutMapping("update/{user_id}")
    public ResponseEntity<User> updateUser(@PathVariable("user_id") int id, @RequestBody User user) {
        User existingUser = userService.getUserByUID(id);
        existingUser.setUserUpdatedAt(ZonedDateTime.now());
        existingUser.setUsername(user.getUsername());
        existingUser.setPassword(user.getPassword());
        User updatedUser = userService.updateUserById(id, existingUser);
        return updatedUser == null
                ? ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
                : ResponseEntity.ok(updatedUser);
    }

    // Delete a user
    @DeleteMapping("/{user_id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("user_id") int id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
