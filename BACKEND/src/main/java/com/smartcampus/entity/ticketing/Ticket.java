package com.smartcampus.entity.ticketing;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.smartcampus.entity.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private String locationCategory;

    @Column(length = 200)
    private String buildingName;

    private Integer floorNumber;

    @Column(length = 20)
    private String block;

    @Column(length = 20)
    private String roomNumber;

    @Column(length = 255)
    private String otherLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN;

    @Column(length = 500)
    private String location;

    @Column(length = 20)
    private String contactPhone;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false)
    private String creatorName;

    private Long assignedTechnicianId;

    private String assignedTechnicianName;

    @Column(columnDefinition = "TEXT")
    private String additionalTechnicianIds;

    @Column(columnDefinition = "TEXT")
    private String additionalTechnicianNames;

    @Column(columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(columnDefinition = "TEXT")
    private String completionNotes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime expectedCompletionAt;

    @Column(length = 500)
    private String warningMessage;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime closedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments;
}
