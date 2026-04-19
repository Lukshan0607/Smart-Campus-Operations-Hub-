package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.entity.BookingHistory;

public interface BookingHistoryRepository extends JpaRepository<BookingHistory, Long> {

    List<BookingHistory> findByBookingIdOrderByActionAtDesc(Long bookingId);

    @Transactional
    void deleteByBookingId(Long bookingId);
}