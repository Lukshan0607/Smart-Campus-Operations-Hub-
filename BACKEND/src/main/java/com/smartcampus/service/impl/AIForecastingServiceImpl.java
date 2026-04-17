package com.smartcampus.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.smartcampus.service.AIForecastingService;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.entity.Booking;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;
import weka.classifiers.functions.LinearRegression;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AIForecastingServiceImpl implements AIForecastingService {
    
    private final BookingRepository bookingRepository;

    @Override
    public double forecastResourceDemand(Long resourceId, int daysAhead) {
        List<Booking> bookings = bookingRepository.findHistoricalBookingsForResource(resourceId);
        if (bookings == null || bookings.isEmpty()) {
            return 0.0; // Not enough data to forecast
        }

        // Group by day index (from first booking)
        LocalDate startDate = bookings.get(0).getStartTime().toLocalDate();
        Map<Long, Double> dailyDemand = new HashMap<>();

        for (Booking b : bookings) {
            long dayIndex = ChronoUnit.DAYS.between(startDate, b.getStartTime().toLocalDate());
            double currentQty = dailyDemand.getOrDefault(dayIndex, 0.0);
            dailyDemand.put(dayIndex, currentQty + b.getQuantity());
        }

        if (dailyDemand.size() < 2) {
            return dailyDemand.values().iterator().next();
        }

        // Prepare Weka dataset
        ArrayList<Attribute> attributes = new ArrayList<>();
        attributes.add(new Attribute("dayIndex"));
        attributes.add(new Attribute("demand"));

        Instances data = new Instances("DemandForecast", attributes, dailyDemand.size());
        data.setClassIndex(1); // Set "demand" as the target variable

        for (Map.Entry<Long, Double> entry : dailyDemand.entrySet()) {
            Instance inst = new DenseInstance(2);
            inst.setValue(attributes.get(0), entry.getKey());
            inst.setValue(attributes.get(1), entry.getValue());
            data.add(inst);
        }

        try {
            LinearRegression model = new LinearRegression();
            model.buildClassifier(data);

            long targetDayIndex = ChronoUnit.DAYS.between(startDate, LocalDate.now().plusDays(daysAhead));
            
            Instance testInst = new DenseInstance(2);
            testInst.setDataset(data);
            testInst.setValue(attributes.get(0), targetDayIndex);
            
            double forecast = model.classifyInstance(testInst);
            return Math.max(0.0, forecast); // Demand cannot be negative
        } catch (Exception e) {
            e.printStackTrace();
            double sum = 0;
            for (Double val : dailyDemand.values()) sum += val;
            return sum / dailyDemand.size();
        }
    }
}
