package com.smartcampus.service;

import java.util.List;

import com.smartcampus.dto.MaintenanceHistoryDTO;

public interface MaintenanceHistoryService {
    List<MaintenanceHistoryDTO> recentForResource(Long resourceId);
}

