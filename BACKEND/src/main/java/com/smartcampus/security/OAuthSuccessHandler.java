package com.smartcampus.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.smartcampus.entity.User;
import com.smartcampus.entity.AuthProvider;
import com.smartcampus.entity.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;

@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        System.out.println("Google Login Success: " + email);

        // Find or create user
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            
            // Check if user is deactivated
            if (!"Active".equals(user.getStatus())) {
                // Redirect to login page with error for deactivated user
                response.sendRedirect("http://localhost:5173/login?error=account_deactivated");
                return;
            }
        } else {
            // Create new user for Google OAuth
            long count = userRepository.count() + 1;
            String userId = String.format("USR%04d", count);

            user = User.builder()
                    .userId(userId)
                    .name(name)
                    .email(email)
                    .role(Role.USER)
                    .provider(AuthProvider.GOOGLE)
                    .build();

            userRepository.save(user);
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        // Create user data for frontend
        String userData = String.format("{\"userId\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                user.getUserId(), user.getName(), user.getEmail(), user.getRole());

        // Redirect to frontend with token and user data
        response.sendRedirect("http://localhost:5173/oauth-success?token=" + token + "&user=" + 
                java.net.URLEncoder.encode(userData, "UTF-8"));
    }
}