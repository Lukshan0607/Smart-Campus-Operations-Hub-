package com.smartcampus.dto;

import java.time.LocalDateTime;

import com.smartcampus.entity.Booking.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private String location;

    private Long userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer quantity;
    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status;

    private String rejectionReason;
    private String cancellationReason;

    private Long reviewedBy;
    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private long remainingMinutes;
    private boolean overdue;
}