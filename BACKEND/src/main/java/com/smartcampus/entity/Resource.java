package com.smartcampus.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ResourceType type;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    @Default
    private Integer capacity = 1;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String location;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    @Default
    private Integer totalQuantity = 1;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    @Default
    private Integer availableQuantity = 1;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(unique = true, length = 255)
    private String qrCodeHash;

    @Column(nullable = false)
    @Default
    private Integer incidentReportCount = 0;

    private LocalDateTime lastIncidentDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @NotNull
    @Column(nullable = false)
    private Long createdBy;

    public enum ResourceType {
        LECTURE_HALL,
        LAB,
        MEETING_ROOM,
        PROJECTOR,
        CAMERA,
        LAPTOP,
        OTHER
    }

    public enum ResourceStatus {
        ACTIVE,
        OUT_OF_SERVICE,
        UNDER_REVIEW,
        MAINTENANCE
    }
}

