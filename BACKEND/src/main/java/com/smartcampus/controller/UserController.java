package com.smartcampus.controller;

import com.smartcampus.entity.User;
import com.smartcampus.entity.Role;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private boolean isValidPassword(String password) {
        return password != null && password.length() >= 8;
    }

    // GET all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET user by ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // POST create new user
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            log.info("Creating user with email: {}", user.getEmail());
            
            // Validate required fields
            if (user.getName() == null || user.getName().trim().isEmpty()) {
                log.warn("Name is required for user creation");
                return ResponseEntity.badRequest().body("Name is required");
            }
            
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                log.warn("Email is required for user creation");
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                log.warn("Password is required for user creation");
                return ResponseEntity.badRequest().body("Password is required");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                log.warn("Email already exists: {}", user.getEmail());
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Generate userId
            long count = userRepository.count() + 1;
            String userId = String.format("USR%04d", count);
            log.info("Generated userId: {}", userId);

            // Validate password
            if (!isValidPassword(user.getPassword())) {
                log.warn("Invalid password provided for user: {}", user.getEmail());
                return ResponseEntity.badRequest().body("Password must be at least 8 characters long");
            }

            // Create new user
            User newUser = User.builder()
                    .userId(userId)
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .password(passwordEncoder.encode(user.getPassword()))
                    .role(user.getRole() != null ? user.getRole() : Role.USER)
                    .status(user.getStatus() != null ? user.getStatus() : "Active")
                    .provider(com.smartcampus.entity.AuthProvider.LOCAL)
                    .build();

            log.info("Saving user to database: {}", newUser.getEmail());
            User savedUser = userRepository.save(newUser);
            log.info("User created successfully with ID: {}", savedUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT update user
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Update fields
        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhone(user.getPhone());
        existingUser.setRole(user.getRole());

        // Update password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            if (!isValidPassword(user.getPassword())) {
                throw new RuntimeException("Password must be at least 8 characters long");
            }
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    // PATCH toggle user status
    @PatchMapping("/{id}/status")
    public User toggleUserStatus(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            // Toggle status between Active and Deactive
            String newStatus = "Active".equals(user.getStatus()) ? "Deactive" : "Active";
            user.setStatus(newStatus);

            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to toggle user status: " + e.getMessage());
        }
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // GET users by role
    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable Role role) {
        return userRepository.findByRole(role);
    }

    // GET users by status (when status field is added)
    // @GetMapping("/status/{status}")
    // public List<User> getUsersByStatus(@PathVariable String status) {
    //     return userRepository.findByStatus(status);
    // }
}
