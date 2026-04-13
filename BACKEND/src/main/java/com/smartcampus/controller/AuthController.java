package com.smartcampus.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Simple login endpoint for demo/testing
     * No authentication manager integration yet - just returns demo token
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // For demo purposes - accept any username with password "password"
        if (request.password == null || !request.password.equals("password")) {
            return ResponseEntity.status(401).build();
        }

        // Generate a simple token (in real app, use JWT with proper signing)
        String token = "demo-token-" + System.currentTimeMillis();
        String role = detectRole(request.username);

        return ResponseEntity.ok(new LoginResponse(
            token,
            request.username,
            role,
            1L // demo userId
        ));
    }

    private String detectRole(String username) {
        if (username.contains("admin")) return "ADMIN";
        if (username.contains("tech")) return "TECHNICIAN";
        if (username.contains("lecturer")) return "LECTURER";
        return "STUDENT";
    }

    @Data
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String username;
        private String role;
        private Long userId;
    }

    @Data
    public static class LoginRequest {
        public String username;
        public String password;
    }
}
