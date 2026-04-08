package com.smartcampus.service;

import com.smartcampus.dto.AvailabilityRequestDTO;
import com.smartcampus.dto.AvailabilityResponseDTO;

public interface AvailabilityService {
    AvailabilityResponseDTO checkAvailability(AvailabilityRequestDTO request);
}

