package com.smartcampus.controller.ticketing;

import com.smartcampus.dto.ticketing.AttachmentDTO;
import com.smartcampus.dto.ticketing.TicketRequestDTO;
import com.smartcampus.dto.ticketing.TicketResponseDTO;
import com.smartcampus.entity.TicketStatus;
import com.smartcampus.service.ticketing.AttachmentService;
import com.smartcampus.service.ticketing.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AttachmentService attachmentService;

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @RequestBody TicketRequestDTO request,
                                                          Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        TicketResponseDTO created = ticketService.createTicket(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicket(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        TicketResponseDTO dto = ticketService.getTicketById(id, username);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id,
                                                          @Valid @RequestBody StatusUpdateRequest request,
                                                          Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        TicketResponseDTO updated = ticketService.updateStatus(id, request.getStatus(), request.getResolutionNote(), username);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> listTickets(@RequestParam(required = false) TicketStatus status,
                                                               @RequestParam(required = false) String priority,
                                                               @RequestParam(required = false) String category,
                                                               Principal principal) {
        List<TicketResponseDTO> tickets = ticketService.listAdminTickets(status, priority, category);
        return ResponseEntity.ok(tickets);
    }

    /**
     * @author Member 3
     */
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> myTickets() {
        return ResponseEntity.ok(ticketService.listMyTickets());
    }

    /**
     * @author Member 3
     */
    @GetMapping("/technician/my-jobs")
    public ResponseEntity<List<TicketResponseDTO>> myJobs() {
        return ResponseEntity.ok(ticketService.listTechnicianJobs());
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(@PathVariable Long id,
                                                               @Valid @RequestBody AssignRequest request,
                                                               Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        TicketResponseDTO assigned = ticketService.assignTechnician(id, request.getTechnicianId(), username);
        return ResponseEntity.ok(assigned);
    }

    /**
     * @author Member 3
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TicketResponseDTO> complete(@PathVariable Long id,
                                                      @Valid @RequestBody CompleteRequest request,
                                                      Principal principal) {
        String username = principal != null ? principal.getName() : "technician";
        return ResponseEntity.ok(ticketService.completeTicket(id, request.getResolutionNote(), username));
    }

    /**
     * @author Member 3
     */
    @PatchMapping("/{id}/admin-status")
    public ResponseEntity<TicketResponseDTO> adminStatus(@PathVariable Long id,
                                                         @Valid @RequestBody AdminStatusRequest request) {
        return ResponseEntity.ok(ticketService.adminUpdateStatus(id, request.getStatus(), request.getReason()));
    }

    @PatchMapping("/{id}/deadline")
    public ResponseEntity<TicketResponseDTO> updateDeadline(@PathVariable Long id,
                                                            @Valid @RequestBody DeadlineRequest request) {
        return ResponseEntity.ok(ticketService.setDeadline(id, request.getExpectedCompletionAt(), request.getWarningMessage()));
    }

    @PostMapping(path = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<AttachmentDTO>> uploadAttachments(@PathVariable Long id,
                                                                 @RequestParam("files") List<MultipartFile> files,
                                                                 Principal principal) {
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one file must be uploaded");
        }
        if (files.size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A maximum of 3 files are allowed");
        }

        for (MultipartFile file : files) {
            String ct = file.getContentType();
            long maxBytes = 5L * 1024L * 1024L;
            if (file.getSize() > maxBytes) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each file must be <= 5MB");
            }
            if (ct == null || !(ct.equalsIgnoreCase(MediaType.IMAGE_JPEG_VALUE)
                    || ct.equalsIgnoreCase(MediaType.IMAGE_PNG_VALUE)
                    || ct.equalsIgnoreCase("image/webp"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only jpeg, png or webp images are allowed");
            }
        }

        String username = principal != null ? principal.getName() : "demo-user";
        List<AttachmentDTO> uploaded = attachmentService.uploadAttachments(id, files, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    /**
     * @author Member 3
     */
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id,
                                            @PathVariable Long imageId,
                                            Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        attachmentService.deleteAttachment(imageId, username);
        return ResponseEntity.noContent().build();
    }

    public static class AssignRequest {
        @NotNull
        private Long technicianId;

        public Long getTechnicianId() {
            return technicianId;
        }

        public void setTechnicianId(Long technicianId) {
            this.technicianId = technicianId;
        }
    }

    public static class CompleteRequest {
        @NotBlank
        private String resolutionNote;

        public String getResolutionNote() {
            return resolutionNote;
        }

        public void setResolutionNote(String resolutionNote) {
            this.resolutionNote = resolutionNote;
        }
    }

    public static class AdminStatusRequest {
        @NotNull
        private TicketStatus status;

        private String reason;

        public TicketStatus getStatus() {
            return status;
        }

        public void setStatus(TicketStatus status) {
            this.status = status;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class StatusUpdateRequest {
        @NotNull
        private TicketStatus status;

        @NotBlank(message = "Resolution note is required when closing or rejecting a ticket")
        private String resolutionNote;

        public TicketStatus getStatus() {
            return status;
        }

        public void setStatus(TicketStatus status) {
            this.status = status;
        }

        public String getResolutionNote() {
            return resolutionNote;
        }

        public void setResolutionNote(String resolutionNote) {
            this.resolutionNote = resolutionNote;
        }
    }

    public static class DeadlineRequest {
        @NotNull
        private LocalDateTime expectedCompletionAt;

        private String warningMessage;

        public LocalDateTime getExpectedCompletionAt() {
            return expectedCompletionAt;
        }

        public void setExpectedCompletionAt(LocalDateTime expectedCompletionAt) {
            this.expectedCompletionAt = expectedCompletionAt;
        }

        public String getWarningMessage() {
            return warningMessage;
        }

        public void setWarningMessage(String warningMessage) {
            this.warningMessage = warningMessage;
        }
    }
}
