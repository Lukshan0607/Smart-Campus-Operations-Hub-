package com.smartcampus.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityWindowDTO {

    @NotNull
    @Min(0)
    @Max(6)
    private Integer dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @Default
    private Boolean isRecurring = Boolean.TRUE;

    private LocalDate validFrom;

    private LocalDate validTo;

    @AssertTrue(message = "endTime must be after startTime")
    public boolean isValidTimeWindow() {
        if (startTime == null || endTime == null) return true;
        return endTime.isAfter(startTime);
    }
}

