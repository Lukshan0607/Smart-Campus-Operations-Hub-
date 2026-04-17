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
public class MaintenanceHistoryDTO {
    private Long id;
    private Long resourceId;
    private Long incidentTicketId;
    private Long reportedBy;
    private String issueDescription;
    private String priority;
    private String status;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private String resolutionNotes;
}

