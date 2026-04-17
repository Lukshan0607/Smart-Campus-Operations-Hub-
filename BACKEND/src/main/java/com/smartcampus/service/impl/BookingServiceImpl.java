package com.smartcampus.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.BookingDecisionDTO;
import com.smartcampus.dto.BookingHistoryDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Booking.BookingStatus;
import com.smartcampus.entity.BookingHistory;
import com.smartcampus.entity.Resource;
import com.smartcampus.exception.ConflictBookingException;
import com.smartcampus.exception.InsufficientQuantityException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedResourceAccessException;
import com.smartcampus.repository.BookingHistoryRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.BookingReminderService;
import com.smartcampus.service.BookingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository bookingHistoryRepository;
    private final ResourceRepository resourceRepository;
    private final BookingReminderService bookingReminderService;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, Long userId) {
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.getResourceId()));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException("Selected resource is not active");
        }

        int bookedQuantity = bookingRepository.getBookedQuantityForTimeRange(
            dto.getResourceId(),
            dto.getStartTime(),
            dto.getEndTime()
        );

        int availableQuantity = resource.getTotalQuantity() - bookedQuantity;
        if (availableQuantity < dto.getQuantity()) {
            throw new InsufficientQuantityException(
                "Only " + availableQuantity + " item(s) available for the selected time range"
            );
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            dto.getResourceId(),
            dto.getStartTime(),
            dto.getEndTime()
        );

        if (!conflicts.isEmpty() && resource.getTotalQuantity() <= 1) {
            throw new ConflictBookingException("The selected time slot is already booked");
        }

        Booking booking = Booking.builder()
            .resource(resource)
            .userId(userId)
            .startTime(dto.getStartTime())
            .endTime(dto.getEndTime())
            .quantity(dto.getQuantity())
            .purpose(dto.getPurpose())
            .expectedAttendees(dto.getExpectedAttendees())
            .status(BookingStatus.PENDING)
            .build();

        booking = bookingRepository.save(booking);

        saveHistory(booking, "CREATED", userId, "Booking request created");

        bookingReminderService.createDefaultReminders(booking.getId());

        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookings(Long userId) {
        return bookingRepository.findMyBookings(userId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAllBookings(BookingStatus status, Pageable pageable) {
        return bookingRepository.findAllWithOptionalStatus(status, pageable)
            .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId, Long userId, boolean adminView) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!adminView && !Objects.equals(booking.getUserId(), userId)) {
            throw new UnauthorizedResourceAccessException("You cannot view this booking");
        }

        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO approveBooking(Long bookingId, Long adminId, BookingDecisionDTO dto) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());

        Resource resource = booking.getResource();
        if (resource.getAvailableQuantity() < booking.getQuantity()) {
            throw new InsufficientQuantityException("Not enough available resources to approve this booking");
        }
        resource.setAvailableQuantity(resource.getAvailableQuantity() - booking.getQuantity());
        resourceRepository.save(resource);

        booking = bookingRepository.save(booking);

        saveHistory(booking, "APPROVED", adminId, dto.getNote());

        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(Long bookingId, Long adminId, BookingDecisionDTO dto) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(dto.getNote());
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());

        booking = bookingRepository.save(booking);

        saveHistory(booking, "REJECTED", adminId, dto.getNote());

        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, Long userId, BookingDecisionDTO dto) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!Objects.equals(booking.getUserId(), userId)) {
            throw new UnauthorizedResourceAccessException("You cannot cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Rejected booking cannot be cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed booking cannot be cancelled");
        }

        if (booking.getStatus() == BookingStatus.APPROVED) {
            Resource resource = booking.getResource();
            resource.setAvailableQuantity(resource.getAvailableQuantity() + booking.getQuantity());
            resourceRepository.save(resource);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(dto.getNote());

        booking = bookingRepository.save(booking);

        saveHistory(booking, "CANCELLED", userId, dto.getNote());

        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponseDTO completeBooking(Long bookingId, Long adminId, BookingDecisionDTO dto) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be marked as completed");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());

        Resource resource = booking.getResource();
        resource.setAvailableQuantity(resource.getAvailableQuantity() + booking.getQuantity());
        resourceRepository.save(resource);

        booking = bookingRepository.save(booking);

        saveHistory(booking, "COMPLETED", adminId, dto.getNote());

        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingHistoryDTO> getBookingHistory(Long bookingId, Long userId, boolean adminView) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!adminView && !Objects.equals(booking.getUserId(), userId)) {
            throw new UnauthorizedResourceAccessException("You cannot view this booking history");
        }

        return bookingHistoryRepository.findByBookingIdOrderByActionAtDesc(bookingId).stream()
            .map(history -> BookingHistoryDTO.builder()
                .id(history.getId())
                .bookingId(history.getBooking().getId())
                .action(history.getAction())
                .actionBy(history.getActionBy())
                .note(history.getNote())
                .actionAt(history.getActionAt())
                .build())
            .toList();
    }

    private void saveHistory(Booking booking, String action, Long actionBy, String note) {
        bookingHistoryRepository.save(
            BookingHistory.builder()
                .booking(booking)
                .action(action)
                .actionBy(actionBy)
                .note(note)
                .actionAt(LocalDateTime.now())
                .build()
        );
    }

    private BookingResponseDTO toResponse(Booking booking) {
        long remainingMinutes = Duration.between(LocalDateTime.now(), booking.getEndTime()).toMinutes();
        boolean overdue = LocalDateTime.now().isAfter(booking.getEndTime())
            && booking.getStatus() == BookingStatus.APPROVED;

        return BookingResponseDTO.builder()
            .id(booking.getId())
            .resourceId(booking.getResource().getId())
            .resourceName(booking.getResource().getName())
            .resourceType(booking.getResource().getType().name())
            .location(booking.getResource().getLocation())
            .userId(booking.getUserId())
            .startTime(booking.getStartTime())
            .endTime(booking.getEndTime())
            .quantity(booking.getQuantity())
            .purpose(booking.getPurpose())
            .expectedAttendees(booking.getExpectedAttendees())
            .status(booking.getStatus())
            .rejectionReason(booking.getRejectionReason())
            .cancellationReason(booking.getCancellationReason())
            .reviewedBy(booking.getReviewedBy())
            .reviewedAt(booking.getReviewedAt())
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt())
            .remainingMinutes(Math.max(remainingMinutes, 0))
            .overdue(overdue)
            .build();
    }
}