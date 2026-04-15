package com.smartcampus.service.halls;

import com.smartcampus.dto.halls.CreateHallBookingRequestDTO;
import com.smartcampus.dto.halls.HallBookingRequestDTO;
import com.smartcampus.dto.halls.LectureHallDTO;
import com.smartcampus.entity.halls.BookingStatus;
import com.smartcampus.entity.halls.HallBookingRequest;
import com.smartcampus.entity.halls.LectureHall;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.halls.HallBookingRequestRepository;
import com.smartcampus.repository.halls.LectureHallRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HallService {

    private final LectureHallRepository lectureHallRepository;
    private final HallBookingRequestRepository hallBookingRequestRepository;
    private final NotificationService notificationService;

    public List<LectureHallDTO> listHalls() {
        return lectureHallRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<LectureHallDTO> available(LocalDate date, LocalTime startTime, LocalTime endTime) {
        LocalTime from = startTime == null ? LocalTime.MIN : startTime;
        LocalTime to = endTime == null ? LocalTime.MAX : endTime;

        return lectureHallRepository.findAll().stream()
                .filter(h -> !hallBookingRequestRepository.hasOverlap(h.getId(), date, from, to))
                .map(this::toDto)
                .toList();
    }

    public HallBookingRequestDTO createBooking(CreateHallBookingRequestDTO dto, Long userId, String username) {
        LectureHall hall = lectureHallRepository.findById(dto.getHallId())
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        if (hallBookingRequestRepository.hasOverlap(hall.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time overlap with existing approved booking");
        }

        HallBookingRequest req = new HallBookingRequest();
        req.setLectureHall(hall);
        req.setRequestedById(userId);
        req.setRequestedByName(username);
        req.setDate(dto.getDate());
        req.setStartTime(dto.getStartTime());
        req.setEndTime(dto.getEndTime());
        req.setPurpose(dto.getPurpose());
        req.setExpectedAttendees(dto.getExpectedAttendees());
        req.setStatus(BookingStatus.PENDING);

        return toDto(hallBookingRequestRepository.save(req));
    }

    public List<HallBookingRequestDTO> myBookings(Long userId) {
        return hallBookingRequestRepository.findByRequestedByIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    public List<HallBookingRequestDTO> allBookings() {
        return hallBookingRequestRepository.findAll().stream().map(this::toDto).toList();
    }

    public HallBookingRequestDTO approve(Long id) {
        HallBookingRequest req = hallBookingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found"));
        req.setStatus(BookingStatus.APPROVED);
        req.setRejectionReason(null);
        HallBookingRequest saved = hallBookingRequestRepository.save(req);

        notificationService.create(req.getRequestedById(), req.getRequestedByName(),
                "Hall booking approved", "Your request for " + req.getLectureHall().getName() + " was approved.");

        return toDto(saved);
    }

    public HallBookingRequestDTO reject(Long id, String reason) {
        HallBookingRequest req = hallBookingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found"));
        req.setStatus(BookingStatus.REJECTED);
        req.setRejectionReason(reason);
        HallBookingRequest saved = hallBookingRequestRepository.save(req);

        notificationService.create(req.getRequestedById(), req.getRequestedByName(),
                "Hall booking rejected", "Your request for " + req.getLectureHall().getName() + " was rejected: " + reason);

        return toDto(saved);
    }

    private LectureHallDTO toDto(LectureHall h) {
        LectureHallDTO dto = new LectureHallDTO();
        dto.setId(h.getId());
        dto.setName(h.getName());
        dto.setCapacity(h.getCapacity());
        dto.setLocation(h.getLocation());
        dto.setFacilities(h.getFacilities());
        dto.setStatus(h.getStatus());
        return dto;
    }

    private HallBookingRequestDTO toDto(HallBookingRequest r) {
        HallBookingRequestDTO dto = new HallBookingRequestDTO();
        dto.setId(r.getId());
        dto.setHallId(r.getLectureHall().getId());
        dto.setHallName(r.getLectureHall().getName());
        dto.setRequestedById(r.getRequestedById());
        dto.setRequestedByName(r.getRequestedByName());
        dto.setDate(r.getDate());
        dto.setStartTime(r.getStartTime());
        dto.setEndTime(r.getEndTime());
        dto.setPurpose(r.getPurpose());
        dto.setExpectedAttendees(r.getExpectedAttendees());
        dto.setStatus(r.getStatus());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
