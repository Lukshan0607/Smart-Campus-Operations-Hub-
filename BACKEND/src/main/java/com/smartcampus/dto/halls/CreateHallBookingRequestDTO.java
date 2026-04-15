package com.smartcampus.dto.halls;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateHallBookingRequestDTO {
    @NotNull
    private Long hallId;
    @NotNull
    private LocalDate date;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
    @NotNull
    private String purpose;
    @NotNull
    private Integer expectedAttendees;
}
