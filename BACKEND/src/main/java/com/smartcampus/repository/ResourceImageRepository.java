package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceImage;

public interface ResourceImageRepository extends JpaRepository<ResourceImage, Long> {
    List<ResourceImage> findByResource(Resource resource);
    List<ResourceImage> findByResourceId(Long resourceId);
}

