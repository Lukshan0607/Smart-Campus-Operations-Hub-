package com.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.BookingReminder;

public interface BookingReminderRepository extends JpaRepository<BookingReminder, Long> {

    List<BookingReminder> findByBookingIdOrderByRemindAtAsc(Long bookingId);

    List<BookingReminder> findBySentFalseAndRemindAtBefore(LocalDateTime now);
}