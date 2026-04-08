package com.smartcampus.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.FavoriteResourceDTO;
import com.smartcampus.entity.FavoriteResource;
import com.smartcampus.entity.Resource;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.FavoriteResourceRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.FavoriteResourceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoriteResourceServiceImpl implements FavoriteResourceService {

    private final FavoriteResourceRepository favoriteResourceRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional
    public FavoriteResourceDTO addFavorite(Long userId, Long resourceId, String notes) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        FavoriteResource fav = favoriteResourceRepository.findByUserIdAndResource(userId, resource)
            .orElse(FavoriteResource.builder()
                .userId(userId)
                .resource(resource)
                .addedAt(LocalDateTime.now())
                .build());
        fav.setNotes(notes);
        fav = favoriteResourceRepository.save(fav);

        return FavoriteResourceDTO.builder()
            .id(fav.getId())
            .userId(fav.getUserId())
            .resourceId(resource.getId())
            .addedAt(fav.getAddedAt())
            .notes(fav.getNotes())
            .build();
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));
        favoriteResourceRepository.findByUserIdAndResource(userId, resource)
            .ifPresent(favoriteResourceRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResourceDTO> listFavorites(Long userId) {
        return favoriteResourceRepository.findByUserId(userId).stream()
            .map(f -> FavoriteResourceDTO.builder()
                .id(f.getId())
                .userId(f.getUserId())
                .resourceId(f.getResource().getId())
                .addedAt(f.getAddedAt())
                .notes(f.getNotes())
                .build())
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long resourceId) {
        return favoriteResourceRepository.findByUserId(userId).stream()
            .anyMatch(f -> f.getResource().getId().equals(resourceId));
    }
}

