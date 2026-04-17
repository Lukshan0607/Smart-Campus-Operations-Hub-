package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.BookingHistory;

public interface BookingHistoryRepository extends JpaRepository<BookingHistory, Long> {

    List<BookingHistory> findByBookingIdOrderByActionAtDesc(Long bookingId);
}