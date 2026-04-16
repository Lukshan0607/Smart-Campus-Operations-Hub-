package com.smartcampus.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // USR0001 format
    @Column(unique = true)
    private String userId;

    private String name;

    @Column(unique = true)
    private String email;

    private String phone;

    private String password;

    private String picture;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'Active'")
    private String status;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;
}