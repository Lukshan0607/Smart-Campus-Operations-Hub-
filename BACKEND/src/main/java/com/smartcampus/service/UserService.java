package com.smartcampus.service;

import org.springframework.stereotype.Service;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public String generateUserId() {

        long count = userRepository.count() + 1;

        return String.format("USR%04d", count);
    }
}