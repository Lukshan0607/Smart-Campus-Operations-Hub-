package com.smartcampus.dto;

import java.util.List;
import java.util.Map;

import com.smartcampus.entity.Resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceAnalyticsDTO {
    private List<ResourceBookingCount> mostBookedResources;
    private Map<Integer, Long> peakBookingHours;
    private Map<Long, Double> utilizationRate;
    private List<Resource> resourcesUnderReview;
    private Map<String, Long> weeklyTrends;
}

