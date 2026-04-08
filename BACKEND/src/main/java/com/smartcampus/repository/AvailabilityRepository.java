package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceAvailability;

public interface AvailabilityRepository extends JpaRepository<ResourceAvailability, Long> {
    List<ResourceAvailability> findByResource(Resource resource);
}

