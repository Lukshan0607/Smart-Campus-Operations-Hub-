package com.smartcampus.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Resource.ResourceType;

public interface ResourceService {
    ResourceResponseDTO create(ResourceRequestDTO dto, Long createdBy);
    ResourceResponseDTO getById(Long id, Long userId);
    Page<ResourceResponseDTO> list(String typeFilter, ResourceStatus status, Pageable pageable, Long userId);
    Page<ResourceResponseDTO> filter(ResourceType type, ResourceStatus status, String q, String location, Pageable pageable, Long userId, boolean adminView);
    ResourceResponseDTO update(Long id, ResourceRequestDTO dto, Long userId);
    void delete(Long id, Long userId);
    java.util.Map<String, Object> getStats();
    String generateReport();
}

