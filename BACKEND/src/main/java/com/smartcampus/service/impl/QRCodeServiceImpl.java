package com.smartcampus.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceQRCode;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.QRCodeService;
import com.smartcampus.utils.QRCodeGenerator;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QRCodeServiceImpl implements QRCodeService {

    private final ResourceRepository resourceRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public String generateQrCodeDataUriForResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        String hash = resource.getQrCodeHash();
        if (hash == null || hash.isBlank()) {
            hash = java.util.UUID.randomUUID().toString();
            resource.setQrCodeHash(hash);
            resourceRepository.save(resource);
        }

        String dataUri = QRCodeGenerator.generatePngDataUri(
            "smartcampus://resource/" + resource.getId() + "?h=" + hash,
            256,
            256
        );

        ResourceQRCode qr = ResourceQRCode.builder()
            .resource(resource)
            .qrCodeHash(hash)
            .qrCodeImageUrl(dataUri)
            .generatedAt(java.time.LocalDateTime.now())
            .scanCount(0)
            .build();
        entityManager.persist(qr);

        return dataUri;
    }
}

