package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.MaintenanceHistory;
import com.smartcampus.entity.Resource;

public interface MaintenanceHistoryRepository extends JpaRepository<MaintenanceHistory, Long> {
    List<MaintenanceHistory> findTop5ByResourceOrderByReportedAtDesc(Resource resource);
}

