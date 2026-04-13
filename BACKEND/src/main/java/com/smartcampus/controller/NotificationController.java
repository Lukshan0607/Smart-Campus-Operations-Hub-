package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * @author Member 3
     */
    @GetMapping("/my")
    public ResponseEntity<List<NotificationDTO>> myNotifications(Principal principal) {
        Long userId = 1L;
        return ResponseEntity.ok(notificationService.myNotifications(userId));
    }

    /**
     * @author Member 3
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markRead(@PathVariable Long id, Principal principal) {
        Long userId = 1L;
        return ResponseEntity.ok(notificationService.markRead(id, userId));
    }
}
