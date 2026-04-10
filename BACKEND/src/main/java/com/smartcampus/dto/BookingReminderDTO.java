package com.smartcampus.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingReminderDTO {

    private Long id;
    private Long bookingId;
    private String reminderType;
    private LocalDateTime remindAt;
    private Boolean sent;
    private String deliveryMethod;
}