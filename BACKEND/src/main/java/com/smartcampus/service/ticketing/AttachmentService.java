package com.smartcampus.service.ticketing;

import com.smartcampus.dto.ticketing.AttachmentDTO;
import com.smartcampus.entity.ticketing.Attachment;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.exception.TicketNotFoundException;
import com.smartcampus.repository.ticketing.AttachmentRepository;
import com.smartcampus.repository.ticketing.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    private static final String UPLOAD_DIR = "uploads/tickets/";

    public List<AttachmentDTO> uploadAttachments(Long ticketId, List<MultipartFile> files, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        long currentCount = attachmentRepository.countByTicketId(ticketId);
        if (currentCount + files.size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Maximum 3 attachments allowed per ticket. Current: " + currentCount);
        }

        List<Attachment> attachments = files.stream()
                .map(file -> saveAttachment(file, ticket, username))
                .collect(Collectors.toList());

        return attachments.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private Attachment saveAttachment(MultipartFile file, Ticket ticket, String username) {
        try {
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String fileUrl = UPLOAD_DIR + ticket.getId() + "/" + filename;

            // In a real scenario, save to cloud storage or local file system
            // byte[] bytes = file.getBytes();
            // Files.write(Paths.get(fileUrl), bytes);

            Attachment attachment = new Attachment();
            attachment.setFilename(filename);
            attachment.setFileUrl(fileUrl);
            attachment.setContentType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setUploadedById(extractUserIdFromContext());
            attachment.setUploadedByName(username);
            attachment.setTicket(ticket);

            return attachmentRepository.save(attachment);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file: " + e.getMessage());
        }
    }

    public void deleteAttachment(Long attachmentId, String username) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found with id: " + attachmentId));

        // Check authorization
        Long userId = extractUserIdFromContext();
        if (!attachment.getUploadedById().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own attachments");
        }

        attachmentRepository.deleteById(attachmentId);
    }

    public List<AttachmentDTO> getAttachmentsByTicket(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AttachmentDTO mapToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setTicketId(attachment.getTicket().getId());
        dto.setFilename(attachment.getFilename());
        dto.setFileUrl(attachment.getFileUrl());
        dto.setContentType(attachment.getContentType());
        dto.setFileSize(attachment.getFileSize());
        dto.setUploadedById(attachment.getUploadedById());
        dto.setUploadedByName(attachment.getUploadedByName());
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }

    private Long extractUserIdFromContext() {
        return 1L;
    }
}
