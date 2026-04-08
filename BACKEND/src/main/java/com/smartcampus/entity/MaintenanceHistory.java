package com.smartcampus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "maintenance_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private Long incidentTicketId;

    @Column(nullable = false)
    private Long reportedBy;

    @Column(length = 2000)
    private String issueDescription;

    @Column(length = 20)
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(length = 20)
    private String status; // REPORTED, IN_PROGRESS, RESOLVED

    private LocalDateTime reportedAt;

    private LocalDateTime resolvedAt;

    @Column(length = 2000)
    private String resolutionNotes;
}

