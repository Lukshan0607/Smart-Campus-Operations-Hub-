package com.smartcampus.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String username;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
