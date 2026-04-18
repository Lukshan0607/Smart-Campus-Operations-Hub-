package com.smartcampus.service.ticketing;

import com.smartcampus.dto.ticketing.TicketRequestDTO;
import com.smartcampus.dto.ticketing.TicketResponseDTO;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.entity.TicketStatus;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ticketing.TicketNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.ticketing.TicketRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
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

    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO request, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Final-state tickets cannot be edited");
        }

        Long currentUserId = extractUserIdFromContext();
        boolean isAdmin = hasRole("ADMIN");
        boolean isOwner = ticket.getCreatorId() != null && ticket.getCreatorId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own ticket");
        }

        validateLocation(request);

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

        Ticket updated = ticketRepository.save(ticket);
        notificationService.create(updated.getCreatorId(), updated.getCreatorName(),
                "Ticket updated", "Ticket #" + updated.getId() + " was updated by " + username + ".");

        return mapToDTO(updated);
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
        return ticketRepository.findAll().stream()
                .filter(ticket -> isAssignedToTechnician(ticket, userId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Final-state tickets cannot be updated");
        }

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

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign technicians to final-state tickets");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Technician not found"));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user is not a technician");
        }

        String displayName = technician.getName() != null && !technician.getName().isBlank()
                ? technician.getName()
                : technician.getEmail();

        if (ticket.getAssignedTechnicianId() == null) {
            ticket.setAssignedTechnicianId(technicianId);
            ticket.setAssignedTechnicianName(displayName);
        } else if (!ticket.getAssignedTechnicianId().equals(technicianId)) {
            Set<String> existingIds = csvToSet(ticket.getAdditionalTechnicianIds());
            Set<String> existingNames = csvToSet(ticket.getAdditionalTechnicianNames());

            existingIds.add(String.valueOf(technicianId));
            existingNames.add(displayName);

            ticket.setAdditionalTechnicianIds(String.join(",", existingIds));
            ticket.setAdditionalTechnicianNames(String.join(",", existingNames));
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket updated = ticketRepository.save(ticket);

        notificationService.create(technicianId, displayName,
                "New assigned ticket", "Ticket #" + ticket.getId() + " assigned to you.");
        notificationService.create(ticket.getCreatorId(), ticket.getCreatorName(),
                "Technician assigned", "A technician was assigned to ticket #" + ticket.getId() + ".");

        return mapToDTO(updated);
    }

    public TicketResponseDTO completeTicket(Long id, String resolutionNote, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Final-state tickets cannot be edited");
        }

        Long userId = extractUserIdFromContext();
        if (ticket.getAssignedTechnicianId() != null && !ticket.getAssignedTechnicianId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only assigned technician can complete this ticket");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setCompletionNotes(resolutionNote);
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

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Final-state tickets cannot be edited");
        }

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

    public TicketResponseDTO setDeadline(Long id, LocalDateTime expectedCompletionAt, String warningMessage) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set deadline for final-state tickets");
        }

        if (expectedCompletionAt != null && expectedCompletionAt.isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected completion time must be in the future");
        }
        if (expectedCompletionAt != null && expectedCompletionAt.isAfter(LocalDateTime.now().plusMonths(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected completion time must be within the upcoming month");
        }

        ticket.setExpectedCompletionAt(expectedCompletionAt);
        ticket.setWarningMessage(warningMessage != null && !warningMessage.isBlank() ? warningMessage.trim() : null);

        Ticket updated = ticketRepository.save(ticket);

        if (ticket.getAssignedTechnicianId() != null) {
            notificationService.create(
                    ticket.getAssignedTechnicianId(),
                    ticket.getAssignedTechnicianName() != null ? ticket.getAssignedTechnicianName() : "technician",
                    "Deadline updated",
                    "Deadline for ticket #" + ticket.getId() + " is set to " + expectedCompletionAt + "."
            );
        }

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
        dto.setAdditionalTechnicianIds(ticket.getAdditionalTechnicianIds());
        dto.setAdditionalTechnicianNames(ticket.getAdditionalTechnicianNames());
        dto.setResolutionNote(ticket.getResolutionNote());
        dto.setCompletionNotes(ticket.getCompletionNotes());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setExpectedCompletionAt(ticket.getExpectedCompletionAt());
        dto.setWarningMessage(ticket.getWarningMessage());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setClosedAt(ticket.getClosedAt());
        dto.setAttachments(attachmentService.getAttachmentsByTicket(ticket.getId()));
        return dto;
    }

    private Long extractUserIdFromContext() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String userIdHeader = attributes.getRequest().getHeader("X-User-Id");
            if (userIdHeader != null && !userIdHeader.isBlank()) {
                try {
                    return Long.parseLong(userIdHeader.trim());
                } catch (NumberFormatException ignored) {
                }
            }

            String usernameHeader = attributes.getRequest().getHeader("X-Username");
            Long resolvedFromHeader = resolveDemoUserId(usernameHeader);
            if (resolvedFromHeader != null) {
                return resolvedFromHeader;
            }
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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

        String normalized = username.trim().toLowerCase();
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

    private boolean isFinalStatus(TicketStatus status) {
        return status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED || status == TicketStatus.REJECTED;
    }

    private boolean isAssignedToTechnician(Ticket ticket, Long userId) {
        if (userId == null) {
            return false;
        }
        if (ticket.getAssignedTechnicianId() != null && ticket.getAssignedTechnicianId().equals(userId)) {
            return true;
        }
        Set<String> additionalIds = csvToSet(ticket.getAdditionalTechnicianIds());
        return additionalIds.contains(String.valueOf(userId));
    }

    private Set<String> csvToSet(String csv) {
        if (csv == null || csv.isBlank()) {
            return new LinkedHashSet<>();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public TicketResponseDTO removeTechnician(Long ticketId, Long technicianId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot remove technician from a ticket in final status");
        }

        // Check if at least one technician will remain
        boolean isPrimary = ticket.getAssignedTechnicianId() != null && 
                           ticket.getAssignedTechnicianId().equals(technicianId);
        Set<String> additionalIds = csvToSet(ticket.getAdditionalTechnicianIds());
        
        if (isPrimary && additionalIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot remove the only technician. At least one technician must be assigned.");
        }

        if (isPrimary) {
            // Move first additional to primary
            if (!additionalIds.isEmpty()) {
                String firstAdditional = additionalIds.iterator().next();
                additionalIds.remove(firstAdditional);
                
                Long newPrimaryId = Long.parseLong(firstAdditional.split(",")[0].trim());
                User newPrimary = userRepository.findById(newPrimaryId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                
                ticket.setAssignedTechnicianId(newPrimaryId);
                ticket.setAssignedTechnicianName(newPrimary.getName());
                
                ticket.setAdditionalTechnicianIds(
                    String.join(",", additionalIds.stream()
                        .map(id -> id.split(",")[0].trim())
                        .collect(Collectors.toList()))
                );
                
                ticket.setAdditionalTechnicianNames(
                    String.join(",", additionalIds.stream()
                        .map(id -> id.split(",")[1].trim())
                        .collect(Collectors.toList()))
                );
            }
        } else {
            // Remove from additional
            Set<String> idSet = csvToSet(ticket.getAdditionalTechnicianIds());
            Set<String> nameSet = csvToSet(ticket.getAdditionalTechnicianNames());
            
            idSet.remove(String.valueOf(technicianId));
            
            ticket.setAdditionalTechnicianIds(String.join(",", idSet));
            ticket.setAdditionalTechnicianNames(String.join(",", nameSet));
        }

        Ticket updated = ticketRepository.save(ticket);
        return mapToDTO(updated);
    }

    public void deleteTicket(Long ticketId, String username) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

            // Cascade delete will handle attachments and comments
            ticketRepository.deleteById(ticketId);
        } catch (TicketNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error deleting ticket: " + e.getMessage());
        }
    }

    public TicketResponseDTO updateCategory(Long ticketId, String category, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        if (isFinalStatus(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot update category for a ticket in final status");
        }

        if (category == null || category.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category cannot be empty");
        }

        ticket.setCategory(category);
        Ticket updated = ticketRepository.save(ticket);
        return mapToDTO(updated);
    }
}
