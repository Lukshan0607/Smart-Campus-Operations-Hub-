package com.smartcampus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resource_qr_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceQRCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "resource_id", nullable = false, unique = true)
    private Resource resource;

    @Column(nullable = false, unique = true, length = 255)
    private String qrCodeHash;

    @Column(length = 500)
    private String qrCodeImageUrl;

    private LocalDateTime generatedAt;

    private LocalDateTime lastScannedAt;

    @Column(nullable = false)
    @Default
    private Integer scanCount = 0;
}

