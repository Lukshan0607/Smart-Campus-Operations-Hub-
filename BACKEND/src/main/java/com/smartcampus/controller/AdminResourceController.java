package com.smartcampus.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Resource.ResourceType;
import com.smartcampus.service.ResourceService;
import com.smartcampus.service.AIForecastingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/resources")
@RequiredArgsConstructor
public class AdminResourceController {

    private final ResourceService resourceService;
    private final AIForecastingService aiForecastingService;

    @GetMapping
    public ResponseEntity<Page<ResourceResponseDTO>> filter(@RequestParam(name = "type", required = false) ResourceType type,
                                                           @RequestParam(name = "status", required = false) ResourceStatus status,
                                                           @RequestParam(name = "q", required = false) String q,
                                                           @RequestParam(name = "location", required = false) String location,
                                                           Pageable pageable,
                                                           @RequestParam(name = "userId", required = false) Long userId) {
        return ResponseEntity.ok(resourceService.filter(type, status, q, location, pageable, userId, true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestParam(name = "userId", defaultValue = "1") Long userId) {
        resourceService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestParam ResourceStatus status,
                                          @RequestParam(name = "userId", defaultValue = "1") Long userId) {
        var current = resourceService.getById(id, userId);
        var dto = com.smartcampus.dto.ResourceRequestDTO.builder()
            .name(current.getName())
            .description(current.getDescription())
            .type(current.getType())
            .capacity(current.getCapacity())
            .location(current.getLocation())
            .totalQuantity(current.getTotalQuantity())
            .status(status)
            .build();
        return ResponseEntity.ok(resourceService.update(id, dto, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> update(@PathVariable Long id,
                                                      @jakarta.validation.Valid @RequestBody ResourceRequestDTO dto,
                                                      @RequestParam(name = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(resourceService.update(id, dto, userId));
    }

    @GetMapping("/{id}/forecast")
    public ResponseEntity<Double> getForecast(@PathVariable Long id, @RequestParam(defaultValue = "7") int daysAhead) {
        return ResponseEntity.ok(aiForecastingService.forecastResourceDemand(id, daysAhead));
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats() {
        return ResponseEntity.ok(resourceService.getStats());
    }

    @GetMapping("/report")
    public ResponseEntity<byte[]> generateReport() {
        String csv = resourceService.generateReport();
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resources_report.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(bytes);
    }
}

