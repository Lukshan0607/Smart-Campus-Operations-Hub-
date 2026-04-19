package com.smartcampus.controller;

import com.smartcampus.entity.*;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/auth", "/api/auth"})
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ---------------- GOOGLE LOGIN SUCCESS ----------------
    @GetMapping("/login-success")
    public Map<String, Object> loginSuccess(@AuthenticationPrincipal OAuth2User user) {

        return Map.of(
                "message", "Google Login Successful!",
                "email", user.getAttribute("email"),
                "name", user.getAttribute("name"),
                "picture", user.getAttribute("picture")
        );
    }

    // ---------------- GOOGLE LOGIN FAILURE ----------------
    @GetMapping("/login-failure")
    public Map<String, String> loginFailure() {
        return Map.of("error", "Login failed");
    }

    // ---------------- TEST CONNECTION ----------------
    @GetMapping("/test")
    public Map<String, String> testConnection() {
        return Map.of(
                "message", "Backend running",
                "status", "OK"
        );
    }

    // ---------------- SIGNUP ----------------
    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody User request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return Map.of("error", "Email already exists");
        }

        long count = userRepository.count() + 1;
        String userId = String.format("USR%04d", count);

        User user = User.builder()
                .userId(userId)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status("Active")
                .provider(AuthProvider.LOCAL)
                .build();

        userRepository.save(user);

        return Map.of(
                "message", "Account created successfully",
                "userId", userId
        );
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return Map.of("error", "Invalid email or password");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Map.of("error", "Invalid email or password");
        }

        // Check user status
        if (!"Active".equals(user.getStatus())) {
            return Map.of("error", "Account is deactivated. Please contact administrator.");
        }

        // Allow all roles to login (USER, ADMIN, TECHNICIAN)

        // generate JWT
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return Map.of(
                "message", "Login successful",
                "token", token,
                "user", Map.of(
                        "userId", user.getUserId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }

                @GetMapping("/technicians")
                public List<Map<String, Object>> getTechnicians() {
                return userRepository.findByRole(Role.TECHNICIAN).stream()
                            .map(user -> {
                                Map<String, Object> item = new LinkedHashMap<>();
                                item.put("id", user.getId());
                                item.put("userId", user.getUserId());
                                item.put("name", user.getName());
                                item.put("email", user.getEmail());
                                item.put("displayName", user.getName() != null && !user.getName().isBlank() ? user.getName() : user.getEmail());
                                item.put("role", user.getRole());
                                return item;
                            })
                    .toList();
                }
}
