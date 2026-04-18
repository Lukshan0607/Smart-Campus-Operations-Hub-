package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.entity.Notification;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public void create(Long userId, String username, String title, String message) {
        if (userId == null) {
            log.warn("Skipping notification because userId is null. title={}, message={}", title, message);
            return;
        }

        Notification n = new Notification();
        n.setUserId(userId);
        n.setUsername(username != null && !username.isBlank() ? username : "system");
        n.setTitle(title != null && !title.isBlank() ? title : "Notification");
        n.setMessage(message != null && !message.isBlank() ? message : "Update available");
        n.setRead(false);
        notificationRepository.save(n);
    }

    public List<NotificationDTO> myNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public NotificationDTO markRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!n.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot mark another user's notification");
        }

        n.setRead(true);
        return toDto(notificationRepository.save(n));
    }

    private NotificationDTO toDto(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setUserId(n.getUserId());
        dto.setUsername(n.getUsername());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
