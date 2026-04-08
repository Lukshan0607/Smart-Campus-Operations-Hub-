package com.smartcampus.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.MaintenanceHistoryDTO;
import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceAvailability;
import com.smartcampus.entity.ResourceImage;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedResourceAccessException;
import com.smartcampus.repository.AvailabilityRepository;
import com.smartcampus.repository.FavoriteResourceRepository;
import com.smartcampus.repository.MaintenanceHistoryRepository;
import com.smartcampus.repository.ResourceImageRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.ResourceSpecifications;
import com.smartcampus.service.ResourceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceImageRepository resourceImageRepository;
    private final AvailabilityRepository availabilityRepository;
    private final FavoriteResourceRepository favoriteResourceRepository;
    private final MaintenanceHistoryRepository maintenanceHistoryRepository;

    @Override
    @Transactional
    public ResourceResponseDTO create(ResourceRequestDTO dto, Long createdBy) {
        if (resourceRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Resource name already exists: " + dto.getName());
        }

        Resource resource = Resource.builder()
            .name(dto.getName())
            .description(dto.getDescription())
            .type(dto.getType())
            .capacity(defaultIfNull(dto.getCapacity(), 1))
            .location(dto.getLocation())
            .totalQuantity(defaultIfNull(dto.getTotalQuantity(), 1))
            .availableQuantity(defaultIfNull(dto.getTotalQuantity(), 1))
            .status(dto.getStatus())
            .qrCodeHash(UUID.randomUUID().toString())
            .createdBy(createdBy)
            .incidentReportCount(0)
            .lastIncidentDate(null)
            .build();

        resource = resourceRepository.save(resource);

        if (dto.getImages() != null) {
            boolean first = true;
            for (String url : dto.getImages()) {
                if (url == null || url.isBlank()) continue;
                resourceImageRepository.save(ResourceImage.builder()
                    .resource(resource)
                    .imageUrl(url)
                    .isPrimary(first)
                    .uploadedAt(LocalDateTime.now())
                    .build());
                first = false;
            }
        }

        if (dto.getAvailabilityWindows() != null) {
            for (var w : dto.getAvailabilityWindows()) {
                availabilityRepository.save(ResourceAvailability.builder()
                    .resource(resource)
                    .dayOfWeek(w.getDayOfWeek())
                    .startTime(w.getStartTime())
                    .endTime(w.getEndTime())
                    .isRecurring(Objects.requireNonNullElse(w.getIsRecurring(), Boolean.TRUE))
                    .validFrom(w.getValidFrom())
                    .validTo(w.getValidTo())
                    .build());
            }
        }

        return toResponse(resource, createdBy);
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponseDTO getById(Long id, Long userId) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        return toResponse(resource, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> list(String typeFilter, Resource.ResourceStatus status, Pageable pageable, Long userId) {
        var page = (status == null)
            ? resourceRepository.findAll(pageable)
            : (typeFilter == null || typeFilter.isBlank()
                ? resourceRepository.findByStatus(status, pageable)
                : resourceRepository.findByStatusAndTypeContaining(status, typeFilter, pageable));

        return page.map(r -> toResponse(r, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> filter(Resource.ResourceType type,
                                           Resource.ResourceStatus status,
                                           String q,
                                           String location,
                                           Pageable pageable,
                                           Long userId,
                                           boolean adminView) {
        Specification<Resource> spec = (root, query, cb) -> cb.conjunction();
        spec = spec.and(ResourceSpecifications.typeEquals(type))
            .and(ResourceSpecifications.statusEquals(status))
            .and(ResourceSpecifications.nameContains(q))
            .and(ResourceSpecifications.locationContains(location));

        if (!adminView) {
            spec = spec.and(ResourceSpecifications.statusEquals(Resource.ResourceStatus.ACTIVE));
        }

        return resourceRepository.findAll(spec, pageable).map(r -> toResponse(r, userId));
    }

    @Override
    @Transactional
    public ResourceResponseDTO update(Long id, ResourceRequestDTO dto, Long userId) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        if (!Objects.equals(resource.getCreatedBy(), userId)) {
            throw new UnauthorizedResourceAccessException("You cannot modify this resource.");
        }

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setCapacity(defaultIfNull(dto.getCapacity(), 1));
        resource.setLocation(dto.getLocation());
        resource.setTotalQuantity(defaultIfNull(dto.getTotalQuantity(), 1));
        resource.setStatus(dto.getStatus());

        resource = resourceRepository.save(resource);
        return toResponse(resource, userId);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        if (!Objects.equals(resource.getCreatedBy(), userId)) {
            throw new UnauthorizedResourceAccessException("You cannot delete this resource.");
        }
        resourceRepository.delete(resource);
    }

    private ResourceResponseDTO toResponse(Resource resource, Long userId) {
        List<ResourceImage> images = resourceImageRepository.findByResource(resource);
        String primary = images.stream().filter(ResourceImage::getIsPrimary).map(ResourceImage::getImageUrl).findFirst()
            .orElse(images.stream().findFirst().map(ResourceImage::getImageUrl).orElse(null));
        List<String> all = images.stream().map(ResourceImage::getImageUrl).toList();

        boolean isFav = (userId != null) && favoriteResourceRepository.findByUserIdAndResource(userId, resource).isPresent();

        var recentMaintenance = maintenanceHistoryRepository.findTop5ByResourceOrderByReportedAtDesc(resource).stream()
            .map(m -> MaintenanceHistoryDTO.builder()
                .id(m.getId())
                .resourceId(resource.getId())
                .incidentTicketId(m.getIncidentTicketId())
                .reportedBy(m.getReportedBy())
                .issueDescription(m.getIssueDescription())
                .priority(m.getPriority())
                .status(m.getStatus())
                .reportedAt(m.getReportedAt())
                .resolvedAt(m.getResolvedAt())
                .resolutionNotes(m.getResolutionNotes())
                .build())
            .toList();

        return ResourceResponseDTO.builder()
            .id(resource.getId())
            .name(resource.getName())
            .description(resource.getDescription())
            .type(resource.getType())
            .capacity(resource.getCapacity())
            .location(resource.getLocation())
            .totalQuantity(resource.getTotalQuantity())
            .availableQuantity(resource.getAvailableQuantity())
            .status(resource.getStatus())
            .qrCodeHash(resource.getQrCodeHash())
            .incidentReportCount(resource.getIncidentReportCount())
            .lastIncidentDate(resource.getLastIncidentDate())
            .createdAt(resource.getCreatedAt())
            .updatedAt(resource.getUpdatedAt())
            .createdBy(resource.getCreatedBy())
            .currentAvailableQuantity(resource.getAvailableQuantity())
            .primaryImageUrl(primary)
            .allImageUrls(all)
            .nextAvailableTime(null)
            .isFavorite(isFav)
            .recentMaintenanceIssues(recentMaintenance == null ? Collections.emptyList() : recentMaintenance)
            .build();
    }

    private static Integer defaultIfNull(Integer value, int defaultValue) {
        return value == null ? defaultValue : value;
    }
}

