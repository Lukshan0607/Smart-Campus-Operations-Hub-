package com.smartcampus.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.AvailabilityRequestDTO;
import com.smartcampus.dto.AvailabilityResponseDTO;
import com.smartcampus.dto.TimeSlotDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.AvailabilityService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final ResourceRepository resourceRepository;

    @Override
    @Transactional(readOnly = true)
    public AvailabilityResponseDTO checkAvailability(AvailabilityRequestDTO request) {
        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new IllegalArgumentException("endDateTime must be after startDateTime");
        }

        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + request.getResourceId()));

        int booked = resourceRepository.getBookedQuantityForTimeRange(
            resource.getId(),
            request.getStartDateTime(),
            request.getEndDateTime()
        );

        int currentlyAvailable = Math.max(0, resource.getTotalQuantity() - booked);
        boolean ok = currentlyAvailable >= request.getRequestedQuantity();

        String msg = ok
            ? "Available"
            : "Only " + currentlyAvailable + " available, you requested " + request.getRequestedQuantity();

        List<TimeSlotDTO> alternatives = ok
            ? List.of()
            : List.of(TimeSlotDTO.builder()
                .startDateTime(request.getEndDateTime())
                .endDateTime(request.getEndDateTime().plusHours(1))
                .build());

        return AvailabilityResponseDTO.builder()
            .resourceId(resource.getId())
            .resourceName(resource.getName())
            .totalQuantity(resource.getTotalQuantity())
            .availableQuantity(currentlyAvailable)
            .requestedQuantity(request.getRequestedQuantity())
            .isAvailable(ok)
            .message(msg)
            .alternativeTimeSlots(alternatives)
            .build();
    }
}

