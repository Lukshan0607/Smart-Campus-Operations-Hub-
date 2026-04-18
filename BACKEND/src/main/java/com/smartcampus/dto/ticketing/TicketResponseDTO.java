package com.smartcampus.dto.ticketing;

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

    private String subCategory;

    private String priority;

    private TicketStatus status;

    private String location;

    private String locationCategory;

    private String buildingName;

    private Integer floorNumber;

    private String block;

    private String roomNumber;

    private String otherLocation;

    private String contactPhone;

    private String preferredContact;

    private Long creatorId;

    private String creatorName;

    private Long assignedTechnicianId;

    private String assignedTechnicianName;

    private String additionalTechnicianIds;

    private String additionalTechnicianNames;

    private String resolutionNote;

    private String completionNotes;

    private String rejectionReason;

    private LocalDateTime expectedCompletionAt;

    private String warningMessage;

    private Integer rating;

    private String feedback;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime closedAt;

    private List<CommentDTO> comments;

    private List<AttachmentDTO> attachments;
}
