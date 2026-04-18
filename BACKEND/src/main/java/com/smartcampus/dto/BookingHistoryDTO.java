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
public class BookingHistoryDTO {

    private Long id;
    private Long bookingId;
    private String action;
    private Long actionBy;
    private String note;
    private LocalDateTime actionAt;
}