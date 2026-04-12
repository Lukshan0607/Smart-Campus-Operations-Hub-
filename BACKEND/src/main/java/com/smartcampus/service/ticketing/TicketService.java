package com.smartcampus.service.ticketing;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.entity.TicketStatus;
import com.smartcampus.exception.ticketing.TicketNotFoundException;
import com.smartcampus.repository.ticketing.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    public TicketResponseDTO createTicket(TicketRequestDTO request, String username) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setLocation(request.getLocation());
        ticket.setContactPhone(request.getContactPhone());
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
        boolean isAdmin = hasRole("ADMIN");
        Long userId = extractUserIdFromContext();

        List<Ticket> tickets;
        if (isAdmin) {
            tickets = ticketRepository.findAll();
        } else {
            tickets = ticketRepository.findUserTickets(userId, false);
        }

        return tickets.stream().map(this::mapToDTO).collect(Collectors.toList());
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

        boolean isAdmin = hasRole("ADMIN");
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can assign technicians");
        }

        ticket.setAssignedTechnicianId(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket updated = ticketRepository.save(ticket);
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
        dto.setContactPhone(ticket.getContactPhone());
        dto.setCreatorId(ticket.getCreatorId());
        dto.setCreatorName(ticket.getCreatorName());
        dto.setAssignedTechnicianId(ticket.getAssignedTechnicianId());
        dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
        dto.setResolutionNote(ticket.getResolutionNote());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setClosedAt(ticket.getClosedAt());
        return dto;
    }

    private Long extractUserIdFromContext() {
        // Extract from SecurityContext - this is a placeholder
        // In a real scenario, you'd extract from JWT or user principal
        return 1L;
    }

    private boolean hasRole(String role) {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_" + role));
    }
}
