package com.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Booking.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @Query("""
        SELECT b FROM Booking b
        LEFT JOIN FETCH b.resource
        WHERE (:status IS NULL OR b.status = :status)
        ORDER BY b.createdAt DESC
    """)
    Page<Booking> findAllWithOptionalStatus(@Param("status") BookingStatus status, Pageable pageable);

    @Query("""
        SELECT b FROM Booking b
        LEFT JOIN FETCH b.resource
        WHERE b.userId = :userId
        ORDER BY b.createdAt DESC
    """)
    List<Booking> findMyBookings(@Param("userId") Long userId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.startTime < :endTime
          AND b.endTime > :startTime
          AND b.status IN ('PENDING', 'APPROVED')
    """)
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    @Query("""
        SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.startTime < :endTime
          AND b.endTime > :startTime
          AND b.status IN ('PENDING', 'APPROVED')
    """)
    int getBookedQuantityForTimeRange(@Param("resourceId") Long resourceId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);
}