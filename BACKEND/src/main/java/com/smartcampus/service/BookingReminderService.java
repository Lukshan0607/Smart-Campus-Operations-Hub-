package com.smartcampus.service;

import java.util.List;

import com.smartcampus.dto.BookingReminderDTO;

public interface BookingReminderService {

    void createDefaultReminders(Long bookingId);

    List<BookingReminderDTO> getRemindersByBooking(Long bookingId);
}