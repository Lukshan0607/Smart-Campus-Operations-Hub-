package com.smartcampus.service.ticketing;

import com.smartcampus.dto.ticketing.TicketRequestDTO;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.dto.ticketing.TicketResponseDTO;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.entity.TicketStatus;
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
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final AttachmentService attachmentService;
    private final UserRepository userRepository;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public TicketResponseDTO createTicket(TicketRequestDTO request, String username) {
        validateLocation(request);
        validateCategoryStructure(request);

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setSubCategory(request.getSubCategory());
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

        Long currentUserId = extractUserIdFromContext();
        boolean isAdmin = hasRole("ADMIN");
        boolean isOwner = ticket.getCreatorId() != null && ticket.getCreatorId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own ticket");
        }

        if (!isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot edit this ticket because it is already in progress or beyond");
        }

        if (!isAdmin && ticket.getAssignedTechnicianId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot edit this ticket after a technician has been assigned");
        }

        validateLocation(request);
        validateCategoryStructure(request);

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setSubCategory(request.getSubCategory());
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

    public void deleteTicket(Long id, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        Long currentUserId = extractUserIdFromContext();
        boolean isAdmin = hasRole("ADMIN");
        boolean isOwner = ticket.getCreatorId() != null && ticket.getCreatorId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own ticket");
        }

        if (!isAdmin && ticket.getAssignedTechnicianId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can delete this ticket only after a technician is assigned");
        }

        Long creatorId = ticket.getCreatorId();
        String creatorName = ticket.getCreatorName();
        Long technicianId = ticket.getAssignedTechnicianId();
        String technicianName = ticket.getAssignedTechnicianName();
        List<Long> additionalTechnicianIds = parseTechnicianIds(ticket.getAdditionalTechnicianIds());
        List<String> additionalTechnicianNames = parseTechnicianNames(ticket.getAdditionalTechnicianNames());

        attachmentService.deleteAttachmentsByTicketId(id);
        ticketRepository.delete(ticket);

        if (isAdmin) {
            if (creatorId != null) {
            notificationService.create(creatorId, creatorName != null ? creatorName : "user",
                "Ticket deleted", "Ticket #" + id + " was deleted by " + username + ".");
            }
            if (technicianId != null) {
            notificationService.create(technicianId, technicianName != null ? technicianName : "technician",
                "Ticket deleted", "Ticket #" + id + " was deleted by " + username + ".");
            }
            notifyAllAdmins("Ticket deleted", "Ticket #" + id + " was deleted by " + username + ".");
            return;
        }

        if (technicianId != null) {
            notificationService.create(
                technicianId,
                technicianName != null ? technicianName : "technician",
                "Ticket deleted by submitter",
                "Ticket #" + id + " was deleted by the submitter " + username + "."
            );
        }

        for (int i = 0; i < additionalTechnicianIds.size(); i++) {
            Long extraId = additionalTechnicianIds.get(i);
            String extraName = i < additionalTechnicianNames.size() ? additionalTechnicianNames.get(i) : "technician";
            notificationService.create(extraId, extraName,
                "Ticket deleted", "Ticket #" + id + " was deleted by " + username + ".");
        }

        notifyAllAdmins(
            "Ticket deleted by submitter",
            "Ticket #" + id + " was deleted by the submitter " + username + "."
        );
    }

    public TicketResponseDTO getTicketById(Long id, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        boolean isAdmin = hasRole("ADMIN");
        boolean isOwner = ticket.getCreatorId().equals(extractUserIdFromContext());
        boolean isAssigned = isTechnicianAssignedToTicket(ticket, extractUserIdFromContext());

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
                .filter(ticket -> isTechnicianAssignedToTicket(ticket, userId))
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

        String technicianDisplayName = resolveTechnicianDisplayName(technicianId);

        if (ticket.getAssignedTechnicianId() == null) {
            ticket.setAssignedTechnicianId(technicianId);
            ticket.setAssignedTechnicianName(technicianDisplayName);
            ticket.setStatus(TicketStatus.IN_PROGRESS);

            Ticket updated = ticketRepository.save(ticket);

            notificationService.create(technicianId, technicianDisplayName,
                "New assigned ticket", "Ticket #" + ticket.getId() + " assigned to you.");
            notificationService.create(ticket.getCreatorId(), ticket.getCreatorName(),
                "Technician assigned", "A technician was assigned to ticket #" + ticket.getId() + ".");

            return mapToDTO(updated);
        }

        if (ticket.getAssignedTechnicianId().equals(technicianId) || isTechnicianAlreadyAdded(ticket, technicianId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Technician is already assigned to this ticket");
        }

        ticket.setAdditionalTechnicianIds(appendCsvValue(ticket.getAdditionalTechnicianIds(), String.valueOf(technicianId)));
        ticket.setAdditionalTechnicianNames(appendCsvValue(ticket.getAdditionalTechnicianNames(), technicianDisplayName));

        Ticket updated = ticketRepository.save(ticket);

        notificationService.create(technicianId, technicianDisplayName,
            "Additional technician assigned", "You were added to ticket #" + ticket.getId() + " as an additional technician.");
        notificationService.create(ticket.getCreatorId(), ticket.getCreatorName(),
            "Additional technician assigned", "An additional technician was added to ticket #" + ticket.getId() + ".");

        return mapToDTO(updated);
    }

    public TicketResponseDTO completeTicket(Long id, String resolutionNote, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        Long userId = extractUserIdFromContext();
        if (!isTechnicianAssignedToTicket(ticket, userId)) {
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
        notifyAdditionalTechnicians(ticket, "Ticket resolved", "Ticket #" + ticket.getId() + " was marked resolved.");
        notifyAdditionalTechnicians(ticket, "Ticket resolved",
            "Ticket #" + ticket.getId() + " was marked resolved.");

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

    public TicketResponseDTO submitRating(Long id, Integer rating, String feedback, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        Long currentUserId = extractUserIdFromContext();
        boolean isAdmin = hasRole("ADMIN");
        boolean isOwner = ticket.getCreatorId() != null && ticket.getCreatorId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the ticket submitter can rate this ticket");
        }

        if (ticket.getStatus() != TicketStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating is available only after the ticket is closed");
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        ticket.setRating(rating);
        ticket.setFeedback(feedback != null && !feedback.isBlank() ? feedback.trim() : null);

        Ticket updated = ticketRepository.save(ticket);

        if (ticket.getAssignedTechnicianId() != null) {
            notificationService.create(
                    ticket.getAssignedTechnicianId(),
                    ticket.getAssignedTechnicianName() != null ? ticket.getAssignedTechnicianName() : "technician",
                    "Ticket rated",
                    "Ticket #" + ticket.getId() + " received a service rating of " + rating + " star(s)."
            );
        }

        notificationService.create(99L, "admin",
                "Ticket rated", "Ticket #" + ticket.getId() + " was rated " + rating + " star(s) by " + username + ".");

        return mapToDTO(updated);
    }

    public TicketResponseDTO setDeadline(Long id, LocalDateTime expectedCompletionAt, String warningMessage) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        if (expectedCompletionAt != null && expectedCompletionAt.isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected completion time must be in the future");
        }

        LocalDateTime maxAllowed = LocalDateTime.now().plusMonths(1);
        if (expectedCompletionAt != null && expectedCompletionAt.isAfter(maxAllowed)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected completion time must be within one month from now");
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

        notifyAdditionalTechnicians(ticket,
            "Deadline updated",
            "Deadline for ticket #" + ticket.getId() + " is set to " + expectedCompletionAt + ".");

        notifyAdditionalTechnicians(ticket, "Deadline updated",
            "Deadline for ticket #" + ticket.getId() + " is set to " + expectedCompletionAt + ".");

        return mapToDTO(updated);
    }

    public List<com.smartcampus.dto.ticketing.TicketReportDTO> getMonthlyReports(Integer year) {
        int targetYear = year != null ? year : Year.now().getValue();
        String sql = """
            SELECT
                DATE_FORMAT(t.created_at, '%Y-%m') AS periodKey,
                DATE_FORMAT(t.created_at, '%b %Y') AS periodLabel,
                COUNT(*) AS totalTickets,
                SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS openTickets,
                SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressTickets,
                SUM(CASE WHEN t.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedTickets,
                SUM(CASE WHEN t.status = 'CLOSED' THEN 1 ELSE 0 END) AS closedTickets,
                SUM(CASE WHEN t.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedTickets
            FROM tickets t
            WHERE YEAR(t.created_at) = :year
            GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), DATE_FORMAT(t.created_at, '%b %Y')
            ORDER BY periodKey
            """;

        return namedParameterJdbcTemplate.query(
                sql,
                new MapSqlParameterSource("year", targetYear),
                (rs, rowNum) -> new com.smartcampus.dto.ticketing.TicketReportDTO(
                    rs.getString("periodKey"),
                    rs.getString("periodLabel"),
                    rs.getLong("totalTickets"),
                    rs.getLong("openTickets"),
                    rs.getLong("inProgressTickets"),
                    rs.getLong("resolvedTickets"),
                    rs.getLong("closedTickets"),
                    rs.getLong("rejectedTickets")
                )
            )
            .stream()
                .collect(Collectors.toList());
    }

    public List<com.smartcampus.dto.ticketing.TicketReportDTO> getYearlyReports() {
        String sql = """
            SELECT
                CAST(YEAR(t.created_at) AS CHAR) AS periodKey,
                CAST(YEAR(t.created_at) AS CHAR) AS periodLabel,
                COUNT(*) AS totalTickets,
                SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS openTickets,
                SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressTickets,
                SUM(CASE WHEN t.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedTickets,
                SUM(CASE WHEN t.status = 'CLOSED' THEN 1 ELSE 0 END) AS closedTickets,
                SUM(CASE WHEN t.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedTickets
            FROM tickets t
            GROUP BY YEAR(t.created_at)
            ORDER BY YEAR(t.created_at)
            """;

        return namedParameterJdbcTemplate.query(
                sql,
                new MapSqlParameterSource(),
                (rs, rowNum) -> new com.smartcampus.dto.ticketing.TicketReportDTO(
                    rs.getString("periodKey"),
                    rs.getString("periodLabel"),
                    rs.getLong("totalTickets"),
                    rs.getLong("openTickets"),
                    rs.getLong("inProgressTickets"),
                    rs.getLong("resolvedTickets"),
                    rs.getLong("closedTickets"),
                    rs.getLong("rejectedTickets")
                )
            )
            .stream()
                .collect(Collectors.toList());
    }

    private TicketResponseDTO mapToDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setSubCategory(ticket.getSubCategory());
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
        dto.setRating(ticket.getRating());
        dto.setFeedback(ticket.getFeedback());
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

    private boolean isTechnicianAssignedToTicket(Ticket ticket, Long technicianId) {
        if (ticket == null || technicianId == null) {
            return false;
        }

        if (ticket.getAssignedTechnicianId() != null && ticket.getAssignedTechnicianId().equals(technicianId)) {
            return true;
        }

        return parseTechnicianIds(ticket.getAdditionalTechnicianIds()).contains(technicianId);
    }

    private boolean isTechnicianAlreadyAdded(Ticket ticket, Long technicianId) {
        return parseTechnicianIds(ticket.getAdditionalTechnicianIds()).contains(technicianId);
    }

    private List<Long> parseTechnicianIds(String raw) {
        List<Long> ids = new ArrayList<>();
        if (raw == null || raw.isBlank()) {
            return ids;
        }

        for (String part : raw.split(",")) {
            String trimmed = part.trim();
            if (trimmed.isBlank()) continue;
            try {
                ids.add(Long.parseLong(trimmed));
            } catch (NumberFormatException ignored) {
            }
        }
        return ids;
    }

    private List<String> parseTechnicianNames(String raw) {
        List<String> names = new ArrayList<>();
        if (raw == null || raw.isBlank()) {
            return names;
        }

        for (String part : raw.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isBlank()) {
                names.add(trimmed);
            }
        }
        return names;
    }

    private String appendCsvValue(String raw, String value) {
        if (value == null || value.isBlank()) {
            return raw;
        }

        Set<String> values = new LinkedHashSet<>();
        if (raw != null && !raw.isBlank()) {
            for (String part : raw.split(",")) {
                String trimmed = part.trim();
                if (!trimmed.isBlank()) {
                    values.add(trimmed);
                }
            }
        }
        values.add(value.trim());
        return String.join(",", values);
    }

    private void notifyAdditionalTechnicians(Ticket ticket, String title, String message) {
        List<Long> ids = parseTechnicianIds(ticket.getAdditionalTechnicianIds());
        List<String> names = parseTechnicianNames(ticket.getAdditionalTechnicianNames());
        for (int i = 0; i < ids.size(); i++) {
            Long techId = ids.get(i);
            String techName = i < names.size() ? names.get(i) : "technician";
            notificationService.create(techId, techName, title, message);
        }
    }

    private String resolveTechnicianDisplayName(Long technicianId) {
        if (technicianId == null) {
            return "technician";
        }

        return switch (technicianId.intValue()) {
            case 2 -> "Technician One";
            case 3 -> "Tech Support";
            default -> "technician-" + technicianId;
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

            private void notifyAllAdmins(String title, String message) {
            userRepository.findByRole(Role.ADMIN)
                .forEach(admin -> notificationService.create(
                    admin.getId(),
                    admin.getName() != null && !admin.getName().isBlank() ? admin.getName() : "admin",
                    title,
                    message
                ));
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

    private void validateCategoryStructure(TicketRequestDTO request) {
        String category = request.getCategory();
        String subCategory = request.getSubCategory();

        if (category == null || category.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
        }
        if (subCategory == null || subCategory.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subcategory is required");
        }

        boolean valid = switch (category.trim().toUpperCase()) {
            case "FACILITIES" -> isOneOf(subCategory, "LIGHTING", "CEILING", "WALL", "FLOOR", "DOOR_WINDOW", "ROOF_LEAKAGE");
            case "ELECTRICAL" -> isOneOf(subCategory, "POWER_FAILURE", "SOCKET", "WIRING", "CIRCUIT_BREAKER", "GENERATOR");
            case "PLUMBING" -> isOneOf(subCategory, "WATER_LEAK", "PIPE_DAMAGE", "TAP_PROBLEM", "TOILET_ISSUE", "DRAINAGE_BLOCK");
            case "IT_NETWORK" -> isOneOf(subCategory, "WIFI_PROBLEM", "INTERNET_DOWN", "LAN_PORT", "SERVER_ISSUE");
            case "EQUIPMENT" -> isOneOf(subCategory, "PROJECTOR", "LAB_PC", "PRINTER", "MICROPHONE", "CAMERA");
            case "CLEANING" -> isOneOf(subCategory, "CLASSROOM_CLEANING", "LAB_CLEANING", "WASHROOM_CLEANING", "GARBAGE_COLLECTION", "CHEMICAL_SPILL");
            case "HVAC" -> isOneOf(subCategory, "AC_NOT_COOLING", "AC_NOISE", "AC_WATER_LEAK", "VENTILATION_PROBLEM");
            case "SAFETY" -> isOneOf(subCategory, "FIRE_ALARM", "EMERGENCY_EXIT_BLOCKED", "BROKEN_GLASS", "HAZARDOUS_AREA", "SECURITY_CONCERN");
            case "FURNITURE" -> isOneOf(subCategory, "BROKEN_CHAIR", "BROKEN_TABLE", "CABINET_DAMAGE", "WHITEBOARD_DAMAGE");
            case "OTHER" -> isOneOf(subCategory, "GENERAL", "UNKNOWN");
            default -> false;
        };

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category/subcategory combination");
        }
    }

    private boolean isOneOf(String value, String... allowed) {
        if (value == null) {
            return false;
        }
        String normalized = value.trim().toUpperCase();
        for (String item : allowed) {
            if (normalized.equals(item)) {
                return true;
            }
        }
        return false;
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
