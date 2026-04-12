package com.smartcampus.service.ticketing;

import com.smartcampus.dto.ticketing.CommentDTO;
import com.smartcampus.entity.ticketing.Comment;
import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.exception.ticketing.TicketNotFoundException;
import com.smartcampus.exception.ticketing.UnauthorizedCommentException;
import com.smartcampus.repository.ticketing.CommentRepository;
import com.smartcampus.repository.ticketing.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public CommentDTO addComment(Long ticketId, String text, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        Comment comment = new Comment();
        comment.setText(text);
        comment.setAuthorId(extractUserIdFromContext());
        comment.setAuthorName(username);
        comment.setTicket(ticket);

        Comment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    public CommentDTO editComment(Long commentId, String newText, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId));

        Long userId = extractUserIdFromContext();
        boolean isAdmin = hasRole("ADMIN");

        if (!comment.getAuthorId().equals(userId) && !isAdmin) {
            throw new UnauthorizedCommentException("You can only edit your own comments");
        }

        comment.setText(newText);
        Comment updated = commentRepository.save(comment);
        return mapToDTO(updated);
    }

    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found with id: " + commentId));

        Long userId = extractUserIdFromContext();
        boolean isAdmin = hasRole("ADMIN");

        if (!comment.getAuthorId().equals(userId) && !isAdmin) {
            throw new UnauthorizedCommentException("You can only delete your own comments");
        }

        commentRepository.deleteById(commentId);
    }

    public List<CommentDTO> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO mapToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicket().getId());
        dto.setText(comment.getText());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setAuthor(comment.getAuthorId().equals(extractUserIdFromContext()));
        return dto;
    }

    private Long extractUserIdFromContext() {
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
