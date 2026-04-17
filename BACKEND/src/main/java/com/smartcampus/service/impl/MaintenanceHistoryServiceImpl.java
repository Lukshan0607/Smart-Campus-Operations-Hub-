package com.smartcampus.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.MaintenanceHistoryDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.MaintenanceHistoryRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.MaintenanceHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MaintenanceHistoryServiceImpl implements MaintenanceHistoryService {

    private final MaintenanceHistoryRepository maintenanceHistoryRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceHistoryDTO> recentForResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        return maintenanceHistoryRepository.findTop5ByResourceOrderByReportedAtDesc(resource).stream()
            .map(m -> MaintenanceHistoryDTO.builder()
                .id(m.getId())
                .resourceId(resourceId)
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
    }
}

