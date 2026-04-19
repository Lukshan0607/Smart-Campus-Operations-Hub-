package com.smartcampus.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.dto.BookingDecisionDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.entity.Booking.BookingStatus;
import com.smartcampus.service.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    // Get all bookings
    @GetMapping
    public ResponseEntity<Page<BookingResponseDTO>> getAll(
            @RequestParam(name = "status", required = false) BookingStatus status,
            Pageable pageable) {

        return ResponseEntity.ok(bookingService.getAllBookings(status, pageable));
    }

    // Approve booking
    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approve(
            @PathVariable Long id,
            @RequestParam(name = "adminId", defaultValue = "1") Long adminId,
            @RequestBody BookingDecisionDTO dto) {

        return ResponseEntity.ok(bookingService.approveBooking(id, adminId, dto));
    }

    // Reject booking
    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> reject(
            @PathVariable Long id,
            @RequestParam(name = "adminId", defaultValue = "1") Long adminId,
            @RequestBody BookingDecisionDTO dto) {

        return ResponseEntity.ok(bookingService.rejectBooking(id, adminId, dto));
    }

    // Complete booking
    @PatchMapping("/{id}/complete")
    public ResponseEntity<BookingResponseDTO> complete(
            @PathVariable Long id,
            @RequestParam(name = "adminId", defaultValue = "1") Long adminId,
            @RequestBody BookingDecisionDTO dto) {

        return ResponseEntity.ok(bookingService.completeBooking(id, adminId, dto));
    }
}