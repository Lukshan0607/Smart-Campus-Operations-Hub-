package com.smartcampus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resource_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] content;

    @Column(name = "image_url", nullable = true)
    private String imageUrl;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_name")
    private String fileName;

    @Column(nullable = false)
    @Default
    private Boolean isPrimary = Boolean.FALSE;

    @Column(nullable = false)
    @Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}

