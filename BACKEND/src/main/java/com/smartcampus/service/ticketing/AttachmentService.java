package com.smartcampus.service.ticketing;

import com.smartcampus.dto.ticketing.AttachmentDTO;
import com.smartcampus.entity.User;
import com.smartcampus.entity.ticketing.Attachment;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.exception.ticketing.TicketNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.ticketing.AttachmentRepository;
import com.smartcampus.repository.ticketing.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

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
            String relativeUrl = "/" + UPLOAD_DIR + ticket.getId() + "/" + filename;
            Path targetDir = Paths.get(UPLOAD_DIR, String.valueOf(ticket.getId()));
            Files.createDirectories(targetDir);
            Files.write(targetDir.resolve(filename), file.getBytes());

            Attachment attachment = new Attachment();
            attachment.setFilename(filename);
            attachment.setFileUrl(relativeUrl);
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

    public void deleteAttachment(Long ticketId, Long attachmentId, String username) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found with id: " + attachmentId));

        if (attachment.getTicket() == null || !attachment.getTicket().getId().equals(ticketId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found for ticket id: " + ticketId);
        }

        // Check authorization
        Long userId = extractUserIdFromContext();
        boolean isOwner = attachment.getUploadedById() != null && attachment.getUploadedById().equals(userId);
        boolean isAdmin = hasRole("ADMIN");
        boolean isTicketSubmitter = attachment.getTicket() != null
            && attachment.getTicket().getCreatorId() != null
            && attachment.getTicket().getCreatorId().equals(userId);

        if (!isOwner && !isAdmin && !isTicketSubmitter) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Only uploader, ticket submitter, or admin can delete this attachment");
        }

        try {
            Path filePath = Paths.get(attachment.getFileUrl().startsWith("/") ? attachment.getFileUrl().substring(1) : attachment.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete attachment file: " + e.getMessage());
        }

        attachmentRepository.deleteById(attachmentId);
    }

    public void deleteAttachmentsByTicketId(Long ticketId) {
        List<Attachment> attachments = attachmentRepository.findByTicketId(ticketId);
        for (Attachment attachment : attachments) {
            try {
                Path filePath = Paths.get(attachment.getFileUrl().startsWith("/") ? attachment.getFileUrl().substring(1) : attachment.getFileUrl());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete attachment file: " + e.getMessage());
            }
        }
        attachmentRepository.deleteAll(attachments);
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
        var attributes = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (attributes instanceof org.springframework.web.context.request.ServletRequestAttributes servletRequestAttributes) {
            String userIdHeader = servletRequestAttributes.getRequest().getHeader("X-User-Id");
            if (userIdHeader != null && !userIdHeader.isBlank()) {
                try {
                    return Long.parseLong(userIdHeader.trim());
                } catch (NumberFormatException ignored) {
                }
            }

            String usernameHeader = servletRequestAttributes.getRequest().getHeader("X-Username");
            Long resolvedFromHeader = resolveDemoUserId(usernameHeader);
            if (resolvedFromHeader != null) {
                return resolvedFromHeader;
            }
        }

        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            Long resolvedFromAuth = resolveDemoUserId(authentication.getName());
            if (resolvedFromAuth != null) {
                return resolvedFromAuth;
            }
        }

        return 1L;
    }

    private Long resolveDemoUserId(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }

        String raw = username.trim();
        if (raw.matches("\\d+")) {
            try {
                return Long.parseLong(raw);
            } catch (NumberFormatException ignored) {
            }
        }

        Long resolvedFromEmail = userRepository.findByEmail(raw)
                .map(User::getId)
                .orElse(null);
        if (resolvedFromEmail != null) {
            return resolvedFromEmail;
        }

        String normalized = raw.toLowerCase();
        return switch (normalized) {
            case "admin" -> 99L;
            case "technician1" -> 2L;
            case "tech-support" -> 3L;
            case "lecturer1" -> 10L;
            default -> null;
        };
    }

    private boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_" + role));
    }
}
