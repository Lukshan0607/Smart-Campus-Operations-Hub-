package com.smartcampus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.AvailabilityRequestDTO;
import com.smartcampus.dto.AvailabilityResponseDTO;
import com.smartcampus.service.AvailabilityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resources/availability")
@RequiredArgsConstructor
public class ResourceAvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping("/check")
    public ResponseEntity<AvailabilityResponseDTO> check(@Valid @RequestBody AvailabilityRequestDTO request) {
        return ResponseEntity.ok(availabilityService.checkAvailability(request));
    }
}

