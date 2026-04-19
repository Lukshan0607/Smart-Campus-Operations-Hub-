package com.smartcampus.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.smartcampus.dto.BookingDecisionDTO;
import com.smartcampus.dto.BookingHistoryDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.entity.Booking.BookingStatus;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO dto, Long userId);

    List<BookingResponseDTO> getMyBookings(Long userId);

    Page<BookingResponseDTO> getAllBookings(BookingStatus status, Pageable pageable);

    BookingResponseDTO getBookingById(Long bookingId, Long userId, boolean adminView);

    BookingResponseDTO updateBooking(Long bookingId, Long userId, BookingRequestDTO dto);

    void deleteBooking(Long bookingId, Long userId);

    BookingResponseDTO approveBooking(Long bookingId, Long adminId, BookingDecisionDTO dto);

    BookingResponseDTO rejectBooking(Long bookingId, Long adminId, BookingDecisionDTO dto);

    BookingResponseDTO cancelBooking(Long bookingId, Long userId, BookingDecisionDTO dto);

    BookingResponseDTO completeBooking(Long bookingId, Long adminId, BookingDecisionDTO dto);

    List<BookingHistoryDTO> getBookingHistory(Long bookingId, Long userId, boolean adminView);
}