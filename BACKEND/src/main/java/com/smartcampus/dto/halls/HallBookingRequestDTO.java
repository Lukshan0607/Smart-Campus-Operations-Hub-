package com.smartcampus.dto.halls;

import com.smartcampus.entity.halls.BookingStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class HallBookingRequestDTO {
    private Long id;
    private Long hallId;
    private String hallName;
    private Long requestedById;
    private String requestedByName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
