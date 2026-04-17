package com.smartcampus.service;

public interface AIForecastingService {
    double forecastResourceDemand(Long resourceId, int daysAhead);
}
