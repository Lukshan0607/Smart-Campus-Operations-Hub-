package com.smartcampus.controller;

import com.smartcampus.dto.halls.CreateHallBookingRequestDTO;
import com.smartcampus.dto.halls.HallBookingRequestDTO;
import com.smartcampus.dto.halls.LectureHallDTO;
import com.smartcampus.dto.halls.RejectBookingRequestDTO;
import com.smartcampus.service.halls.HallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/halls")
@RequiredArgsConstructor
public class HallController {

    private final HallService hallService;

    /**
     * @author Member 3
     */
    @GetMapping
    public ResponseEntity<List<LectureHallDTO>> list() {
        return ResponseEntity.ok(hallService.listHalls());
    }

    /**
     * @author Member 3
     */
    @GetMapping("/available")
    public ResponseEntity<List<LectureHallDTO>> available(@RequestParam LocalDate date,
                                                          @RequestParam(required = false) LocalTime startTime,
                                                          @RequestParam(required = false) LocalTime endTime) {
        return ResponseEntity.ok(hallService.available(date, startTime, endTime));
    }

    /**
     * @author Member 3
     */
    @PostMapping("/bookings")
    public ResponseEntity<HallBookingRequestDTO> createBooking(@Valid @RequestBody CreateHallBookingRequestDTO request,
                                                               Principal principal) {
        String username = principal != null ? principal.getName() : "demo-lecturer";
        Long userId = 1L;
        return ResponseEntity.status(HttpStatus.CREATED).body(hallService.createBooking(request, userId, username));
    }

    /**
     * @author Member 3
     */
    @GetMapping("/bookings/my")
    public ResponseEntity<List<HallBookingRequestDTO>> myBookings(Principal principal) {
        Long userId = 1L;
        return ResponseEntity.ok(hallService.myBookings(userId));
    }

    /**
     * @author Member 3
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<HallBookingRequestDTO>> allBookings() {
        return ResponseEntity.ok(hallService.allBookings());
    }

    /**
     * @author Member 3
     */
    @PatchMapping("/bookings/{id}/approve")
    public ResponseEntity<HallBookingRequestDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(hallService.approve(id));
    }

    /**
     * @author Member 3
     */
    @PatchMapping("/bookings/{id}/reject")
    public ResponseEntity<HallBookingRequestDTO> reject(@PathVariable Long id,
                                                        @Valid @RequestBody RejectBookingRequestDTO request) {
        return ResponseEntity.ok(hallService.reject(id, request.getReason()));
    }
}
