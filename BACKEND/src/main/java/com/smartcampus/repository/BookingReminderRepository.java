package com.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.entity.BookingReminder;

public interface BookingReminderRepository extends JpaRepository<BookingReminder, Long> {

    List<BookingReminder> findByBookingIdOrderByRemindAtAsc(Long bookingId);

    List<BookingReminder> findBySentFalseAndRemindAtBefore(LocalDateTime now);

    @Transactional
    void deleteByBookingId(Long bookingId);
}