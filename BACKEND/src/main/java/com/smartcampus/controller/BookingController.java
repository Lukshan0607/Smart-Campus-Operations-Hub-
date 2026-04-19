package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.dto.BookingDecisionDTO;
import com.smartcampus.dto.BookingHistoryDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Create booking
    @PostMapping
    public ResponseEntity<BookingResponseDTO> create(
            @Valid @RequestBody BookingRequestDTO dto,
            @RequestParam(name = "userId", defaultValue = "1") Long userId) {

        return ResponseEntity.ok(bookingService.createBooking(dto, userId));
    }

    // My bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> myBookings(
            @RequestParam(name = "userId", defaultValue = "1") Long userId) {

        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // Get single booking
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getById(
            @PathVariable Long id,
            @RequestParam(name = "userId", defaultValue = "1") Long userId) {

        return ResponseEntity.ok(bookingService.getBookingById(id, userId, false));
    }

    // Update booking - only pending booking can be updated
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequestDTO dto,
            @RequestParam(name = "userId", defaultValue = "1") Long userId) {

        return ResponseEntity.ok(bookingService.updateBooking(id, userId, dto));
    }

    // Delete booking - only pending booking can be deleted
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam(name = "userId", defaultValue = "1") Long userId) {

        bookingService.deleteBooking(id, userId);
        return ResponseEntity.noContent().build();
    }

    // Cancel booking
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancel(
            @PathVariable Long id,
            @RequestParam(name = "userId", defaultValue = "1") Long userId,
            @RequestBody BookingDecisionDTO dto) {

        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, dto));
    }

    // Booking history
    @GetMapping("/{id}/history")
    public ResponseEntity<List<BookingHistoryDTO>> history(
            @PathVariable Long id,
            @RequestParam(name = "userId", defaultValue = "1") Long userId) {

        return ResponseEntity.ok(bookingService.getBookingHistory(id, userId, false));
    }
}