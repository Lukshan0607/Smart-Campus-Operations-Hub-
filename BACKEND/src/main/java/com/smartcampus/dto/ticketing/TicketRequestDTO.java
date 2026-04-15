package com.smartcampus.dto.ticketing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Location category is required")
    private String locationCategory;

    private String buildingName;

    private Integer floorNumber;

    private String block;

    private String roomNumber;

    private String otherLocation;

    private String location;

    private String contactPhone;

    private String preferredContact;
}
