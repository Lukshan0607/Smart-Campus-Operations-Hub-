package com.smartcampus.security;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.entity.AuthProvider;
import com.smartcampus.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {

        OAuth2User oauthUser = super.loadUser(request);

        Map<String, Object> attributes = oauthUser.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        // check user already exists
        userRepository.findByEmail(email)
                .orElseGet(() -> {

                    // generate custom user id
                    long count = userRepository.count() + 1;
                    String userId = String.format("USR%04d", count);

                    User newUser = User.builder()
                            .userId(userId)
                            .name(name)
                            .email(email)
                            .picture(picture)
                            .role(Role.USER)
                            .provider(AuthProvider.GOOGLE)
                            .build();

                    return userRepository.save(newUser);
                });

        return oauthUser;
    }
}