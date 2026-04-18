package com.smartcampus.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.entity.User;
import com.smartcampus.entity.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // find user by email (used in OAuth login)
    Optional<User> findByEmail(String email);

    // find user by custom userId (USR0001)
    Optional<User> findByUserId(String userId);

    // get users by role (ADMIN / USER / TECHNICIAN)
    List<User> findByRole(Role role);

    // check email exists (signup validation)
    boolean existsByEmail(String email);

}