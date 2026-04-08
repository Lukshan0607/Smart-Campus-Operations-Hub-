package com.smartcampus.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceType;
import com.smartcampus.repository.AvailabilityRepository;
import com.smartcampus.repository.FavoriteResourceRepository;
import com.smartcampus.repository.MaintenanceHistoryRepository;
import com.smartcampus.repository.ResourceImageRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.impl.ResourceServiceImpl;

public class ResourceServiceImplTest {

    @Test
    void create_setsDefaultsAndReturnsResponse() {
        ResourceRepository resourceRepository = Mockito.mock(ResourceRepository.class);
        ResourceImageRepository imageRepo = Mockito.mock(ResourceImageRepository.class);
        AvailabilityRepository availabilityRepo = Mockito.mock(AvailabilityRepository.class);
        FavoriteResourceRepository favRepo = Mockito.mock(FavoriteResourceRepository.class);
        MaintenanceHistoryRepository maintRepo = Mockito.mock(MaintenanceHistoryRepository.class);

        when(resourceRepository.existsByName("Projector A")).thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> {
            Resource r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(imageRepo.findByResource(any(Resource.class))).thenReturn(java.util.List.of());
        when(maintRepo.findTop5ByResourceOrderByReportedAtDesc(any(Resource.class))).thenReturn(java.util.List.of());
        when(favRepo.findByUserIdAndResource(any(), any())).thenReturn(java.util.Optional.empty());

        ResourceServiceImpl service = new ResourceServiceImpl(resourceRepository, imageRepo, availabilityRepo, favRepo, maintRepo);

        ResourceRequestDTO req = ResourceRequestDTO.builder()
            .name("Projector A")
            .type(ResourceType.PROJECTOR)
            .location("Building A, Store Room")
            .totalQuantity(10)
            .build();

        var res = service.create(req, 99L);
        assertEquals("Projector A", res.getName());
        assertEquals(10, res.getTotalQuantity());
        assertEquals(99L, res.getCreatedBy());
    }
}

