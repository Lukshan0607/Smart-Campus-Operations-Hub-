package com.smartcampus.dto;

import com.smartcampus.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {

    private Long id;

    private String title;

    private String description;

    private String category;

    private String priority;

    private TicketStatus status;

    private String location;

    private String contactPhone;

    private Long creatorId;

    private String creatorName;

    private Long assignedTechnicianId;

    private String assignedTechnicianName;

    private String resolutionNote;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime closedAt;

    private List<CommentDTO> comments;

    private List<AttachmentDTO> attachments;
}
