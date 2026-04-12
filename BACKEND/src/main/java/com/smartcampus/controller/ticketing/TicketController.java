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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
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
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id,
                                                          @Valid @RequestBody StatusUpdateRequest request,
                                                          Principal principal) {
        TicketResponseDTO updated = ticketService.updateStatus(id, request.getStatus(), request.getResolutionNote(), principal.getName());
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> listTickets(Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        List<TicketResponseDTO> tickets = ticketService.listTickets(username);
        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> assignTechnician(@PathVariable Long id,
                                                               @RequestParam("technicianId") Long technicianId,
                                                               Principal principal) {
        TicketResponseDTO assigned = ticketService.assignTechnician(id, technicianId, principal.getName());
        return ResponseEntity.ok(assigned);
    }

    @PostMapping(path = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN')")
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

        List<AttachmentDTO> uploaded = attachmentService.uploadAttachments(id, files, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
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
}
