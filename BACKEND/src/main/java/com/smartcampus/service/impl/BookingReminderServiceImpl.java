package com.smartcampus.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.BookingReminderDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingReminder;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.BookingReminderRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.BookingReminderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingReminderServiceImpl implements BookingReminderService {

    private final BookingRepository bookingRepository;
    private final BookingReminderRepository bookingReminderRepository;

    @Override
    @Transactional
    public void createDefaultReminders(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        LocalDateTime startReminderTime = booking.getStartTime().minusHours(1);
        LocalDateTime endReminderTime = booking.getEndTime().minusMinutes(30);

        if (startReminderTime.isAfter(LocalDateTime.now())) {
            bookingReminderRepository.save(
                BookingReminder.builder()
                    .booking(booking)
                    .reminderType("BEFORE_START")
                    .remindAt(startReminderTime)
                    .sent(false)
                    .deliveryMethod("IN_APP")
                    .build()
            );
        }

        if (endReminderTime.isAfter(LocalDateTime.now())) {
            bookingReminderRepository.save(
                BookingReminder.builder()
                    .booking(booking)
                    .reminderType("BEFORE_END")
                    .remindAt(endReminderTime)
                    .sent(false)
                    .deliveryMethod("IN_APP")
                    .build()
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingReminderDTO> getRemindersByBooking(Long bookingId) {
        return bookingReminderRepository.findByBookingIdOrderByRemindAtAsc(bookingId).stream()
            .map(reminder -> BookingReminderDTO.builder()
                .id(reminder.getId())
                .bookingId(reminder.getBooking().getId())
                .reminderType(reminder.getReminderType())
                .remindAt(reminder.getRemindAt())
                .sent(reminder.getSent())
                .deliveryMethod(reminder.getDeliveryMethod())
                .build())
            .toList();
    }
}