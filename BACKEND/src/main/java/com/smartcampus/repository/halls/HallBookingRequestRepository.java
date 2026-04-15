package com.smartcampus.repository.halls;

import com.smartcampus.entity.halls.BookingStatus;
import com.smartcampus.entity.halls.HallBookingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface HallBookingRequestRepository extends JpaRepository<HallBookingRequest, Long> {
    List<HallBookingRequest> findByRequestedByIdOrderByCreatedAtDesc(Long requestedById);

    List<HallBookingRequest> findByLectureHallIdAndDateAndStatus(Long hallId, LocalDate date, BookingStatus status);

    default boolean hasOverlap(Long hallId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<HallBookingRequest> approved = findByLectureHallIdAndDateAndStatus(hallId, date, BookingStatus.APPROVED);
        return approved.stream().anyMatch(b -> startTime.isBefore(b.getEndTime()) && endTime.isAfter(b.getStartTime()));
    }
}
