package com.smartcampus.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final List<UserSummary> DEMO_TECHNICIANS = List.of(
        new UserSummary(2L, "technician1", "TECHNICIAN", "Technician One"),
        new UserSummary(3L, "tech-support", "TECHNICIAN", "Tech Support")
    );

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
            resolveUserId(request.username)
        ));
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserSummary>> technicians() {
        return ResponseEntity.ok(DEMO_TECHNICIANS);
    }

    private String detectRole(String username) {
        if (username.contains("admin")) return "ADMIN";
        if (username.contains("tech")) return "TECHNICIAN";
        if (username.contains("lecturer")) return "LECTURER";
        return "STUDENT";
    }

    private Long resolveUserId(String username) {
        if ("admin".equalsIgnoreCase(username)) return 99L;
        if ("technician1".equalsIgnoreCase(username)) return 2L;
        if ("tech-support".equalsIgnoreCase(username)) return 3L;
        if ("lecturer1".equalsIgnoreCase(username)) return 10L;
        return 1L;
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
    @NoArgsConstructor
    public static class LoginRequest {
        public String username;
        public String password;
    }

    @Data
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
        private String role;
        private String displayName;
    }
}
