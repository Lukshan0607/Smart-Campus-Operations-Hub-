package com.smartcampus.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponseDTO {
    private Long resourceId;
    private String resourceName;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private Integer requestedQuantity;
    private boolean isAvailable;
    private String message;
    private List<TimeSlotDTO> alternativeTimeSlots;
}

