package com.smartcampus.service.ticketing;

import com.smartcampus.dto.ticketing.TicketRequestDTO;
import com.smartcampus.dto.ticketing.TicketResponseDTO;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.entity.TicketStatus;
import com.smartcampus.exception.ticketing.TicketNotFoundException;
import com.smartcampus.repository.ticketing.TicketRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final AttachmentService attachmentService;

    public TicketResponseDTO createTicket(TicketRequestDTO request, String username) {
        validateLocation(request);

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setLocationCategory(request.getLocationCategory());
        ticket.setBuildingName(request.getBuildingName());
        ticket.setFloorNumber(request.getFloorNumber());
        ticket.setBlock(request.getBlock());
        ticket.setRoomNumber(request.getRoomNumber());
        ticket.setOtherLocation(request.getOtherLocation());
        ticket.setLocation(buildLocationSummary(request));
        ticket.setContactPhone(request.getPreferredContact() != null ? request.getPreferredContact() : request.getContactPhone());
        ticket.setCreatorId(extractUserIdFromContext());
        ticket.setCreatorName(username);
        ticket.setStatus(TicketStatus.OPEN);

        Ticket saved = ticketRepository.save(ticket);
        return mapToDTO(saved);
    }

    public TicketResponseDTO getTicketById(Long id, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        boolean isAdmin = hasRole("ADMIN");
        boolean isOwner = ticket.getCreatorId().equals(extractUserIdFromContext());
        boolean isAssigned = ticket.getAssignedTechnicianId() != null && 
                            ticket.getAssignedTechnicianId().equals(extractUserIdFromContext());

        if (!isAdmin && !isOwner && !isAssigned) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this ticket");
        }

        return mapToDTO(ticket);
    }

    public List<TicketResponseDTO> listTickets(String username) {
        return ticketRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TicketResponseDTO> listMyTickets() {
        Long userId = extractUserIdFromContext();
        return ticketRepository.findByCreatorId(userId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TicketResponseDTO> listTechnicianJobs() {
        Long userId = extractUserIdFromContext();
        return ticketRepository.findByAssignedTechnicianId(userId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TicketResponseDTO> listAdminTickets(TicketStatus status, String priority, String category) {
        return ticketRepository.findAll().stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> priority == null || priority.isBlank() || priority.equalsIgnoreCase(t.getPriority()))
                .filter(t -> category == null || category.isBlank() || category.equalsIgnoreCase(t.getCategory()))
                .map(this::mapToDTO)
                .toList();
    }

    public TicketResponseDTO updateStatus(Long id, TicketStatus newStatus, String resolutionNote, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        boolean isAdmin = hasRole("ADMIN");
        boolean isTechnician = hasRole("TECHNICIAN");

        if (!isAdmin && !isTechnician) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only TECHNICIAN or ADMIN can update ticket status");
        }

        ticket.setStatus(newStatus);
        if (resolutionNote != null && !resolutionNote.isBlank()) {
            ticket.setResolutionNote(resolutionNote);
        }

        if (newStatus == TicketStatus.CLOSED || newStatus == TicketStatus.RESOLVED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        Ticket updated = ticketRepository.save(ticket);
        return mapToDTO(updated);
    }

    public TicketResponseDTO assignTechnician(Long id, Long technicianId, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        ticket.setAssignedTechnicianId(technicianId);
        ticket.setAssignedTechnicianName("technician-" + technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket updated = ticketRepository.save(ticket);

        notificationService.create(technicianId, "technician-" + technicianId,
                "New assigned ticket", "Ticket #" + ticket.getId() + " assigned to you.");
        notificationService.create(ticket.getCreatorId(), ticket.getCreatorName(),
                "Technician assigned", "A technician was assigned to ticket #" + ticket.getId() + ".");

        return mapToDTO(updated);
    }

    public TicketResponseDTO completeTicket(Long id, String resolutionNote, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        Long userId = extractUserIdFromContext();
        if (ticket.getAssignedTechnicianId() != null && !ticket.getAssignedTechnicianId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only assigned technician can complete this ticket");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNote(resolutionNote);
        ticket.setClosedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        notificationService.create(ticket.getCreatorId(), ticket.getCreatorName(),
                "Ticket resolved", "Ticket #" + ticket.getId() + " was marked resolved.");
        notificationService.create(999L, "admin", "Ticket resolved",
                "Ticket #" + ticket.getId() + " is awaiting closure.");

        return mapToDTO(updated);
    }

    public TicketResponseDTO adminUpdateStatus(Long id, TicketStatus status, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        if (status == TicketStatus.REJECTED && (reason == null || reason.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reason is required when rejecting a ticket");
        }

        ticket.setStatus(status);
        if (status == TicketStatus.REJECTED) {
            ticket.setRejectionReason(reason);
        }
        if (status == TicketStatus.CLOSED || status == TicketStatus.REJECTED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        Ticket updated = ticketRepository.save(ticket);
        notificationService.create(ticket.getCreatorId(), ticket.getCreatorName(),
                "Ticket status updated", "Ticket #" + ticket.getId() + " is now " + status + ".");
        return mapToDTO(updated);
    }

    private TicketResponseDTO mapToDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setLocation(ticket.getLocation());
        dto.setLocationCategory(ticket.getLocationCategory());
        dto.setBuildingName(ticket.getBuildingName());
        dto.setFloorNumber(ticket.getFloorNumber());
        dto.setBlock(ticket.getBlock());
        dto.setRoomNumber(ticket.getRoomNumber());
        dto.setOtherLocation(ticket.getOtherLocation());
        dto.setContactPhone(ticket.getContactPhone());
        dto.setPreferredContact(ticket.getContactPhone());
        dto.setCreatorId(ticket.getCreatorId());
        dto.setCreatorName(ticket.getCreatorName());
        dto.setAssignedTechnicianId(ticket.getAssignedTechnicianId());
        dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
        dto.setResolutionNote(ticket.getResolutionNote());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setClosedAt(ticket.getClosedAt());
        dto.setAttachments(attachmentService.getAttachmentsByTicket(ticket.getId()));
        return dto;
    }

    private Long extractUserIdFromContext() {
        // Extract from SecurityContext - this is a placeholder
        // In a real scenario, you'd extract from JWT or user principal
        return 1L;
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

    private void validateLocation(TicketRequestDTO request) {
        String category = request.getLocationCategory();
        if (category == null || category.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location category is required");
        }

        if ("OTHER".equalsIgnoreCase(category)) {
            if (request.getOtherLocation() == null || request.getOtherLocation().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please specify where the issue is located");
            }
            return;
        }

        if (request.getBuildingName() == null || request.getBuildingName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building name is required");
        }
        if (request.getFloorNumber() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor number is required");
        }
        if (request.getBlock() == null || request.getBlock().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Block is required");
        }
        if (request.getRoomNumber() == null || request.getRoomNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room number is required");
        }
    }

    private String buildLocationSummary(TicketRequestDTO request) {
        String category = normalizeCategoryLabel(request.getLocationCategory());
        if ("Other".equalsIgnoreCase(category)) {
            return "Other: " + request.getOtherLocation();
        }

        return String.format("%s | Building: %s | Floor: %s | Block: %s | Room: %s",
                category,
                request.getBuildingName(),
                request.getFloorNumber(),
                request.getBlock(),
                request.getRoomNumber());
    }

    private String normalizeCategoryLabel(String category) {
        if (category == null) {
            return "";
        }
        return switch (category.toUpperCase()) {
            case "MAIN_BUILDING" -> "Main Building";
            case "ENGINEERING_BUILDING" -> "Engineering Building";
            case "BUSINESS_MANAGEMENT_BUILDING" -> "Business Management Building";
            case "OTHER" -> "Other";
            default -> category;
        };
    }
}
