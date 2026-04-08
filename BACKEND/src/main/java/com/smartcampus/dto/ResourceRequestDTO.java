package com.smartcampus.dto;

import java.util.List;

import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Resource.ResourceType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequestDTO {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull
    private ResourceType type;

    @Min(1)
    @Default
    private Integer capacity = 1;

    @NotBlank
    private String location;

    @NotNull
    @Positive
    @Default
    private Integer totalQuantity = 1;

    @NotNull
    @Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private List<String> images;

    private List<AvailabilityWindowDTO> availabilityWindows;
}

