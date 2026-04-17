package com.smartcampus.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Resource.ResourceType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponseDTO {
    private Long id;
    private String name;
    private String description;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private ResourceStatus status;
    private String qrCodeHash;
    private Integer incidentReportCount;
    private LocalDateTime lastIncidentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;

    private Integer currentAvailableQuantity;
    private String primaryImageUrl;
    private List<String> allImageUrls;
    private LocalDateTime nextAvailableTime;
    private boolean isFavorite;
    private List<MaintenanceHistoryDTO> recentMaintenanceIssues;
}

