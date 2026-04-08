package com.smartcampus.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.FavoriteResource;
import com.smartcampus.entity.Resource;

public interface FavoriteResourceRepository extends JpaRepository<FavoriteResource, Long> {
    List<FavoriteResource> findByUserId(Long userId);
    Optional<FavoriteResource> findByUserIdAndResource(Long userId, Resource resource);
}

