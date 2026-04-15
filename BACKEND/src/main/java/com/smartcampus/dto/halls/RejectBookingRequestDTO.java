package com.smartcampus.dto.halls;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectBookingRequestDTO {
    @NotBlank
    private String reason;
}
