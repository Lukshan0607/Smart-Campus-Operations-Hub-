package com.smartcampus.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Resource.ResourceType;
import com.smartcampus.repository.ResourceImageRepository;
import com.smartcampus.service.ResourceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceImageRepository resourceImageRepository;

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> create(@Valid @RequestBody ResourceRequestDTO dto,
                                                     @RequestParam(name = "createdBy", defaultValue = "1") Long createdBy) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(dto, createdBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getById(@PathVariable Long id,
                                                       @RequestParam(name = "userId", required = false) Long userId) {
        return ResponseEntity.ok(resourceService.getById(id, userId));
    }

    @GetMapping
    public ResponseEntity<Page<ResourceResponseDTO>> list(@RequestParam(name = "type", required = false) ResourceType type,
                                                          @RequestParam(name = "status", required = false) ResourceStatus status,
                                                          @RequestParam(name = "q", required = false) String q,
                                                          @RequestParam(name = "location", required = false) String location,
                                                          Pageable pageable,
                                                          @RequestParam(name = "userId", required = false) Long userId) {
        return ResponseEntity.ok(resourceService.filter(type, status, q, location, pageable, userId, false));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> update(@PathVariable Long id,
                                                      @Valid @RequestBody ResourceRequestDTO dto,
                                                      @RequestParam(name = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(resourceService.update(id, dto, userId));
    }

    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) {
        return resourceImageRepository.findById(imageId)
            .map(img -> ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(img.getContentType() != null ? img.getContentType() : "image/jpeg"))
                .body(img.getContent()))
            .orElse(ResponseEntity.notFound().build());
    }
}

