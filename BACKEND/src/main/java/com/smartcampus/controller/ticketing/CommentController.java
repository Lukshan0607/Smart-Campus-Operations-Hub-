package com.smartcampus.controller.ticketing;

import com.smartcampus.dto.ticketing.CommentDTO;
import com.smartcampus.service.ticketing.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long ticketId,
                                                 @Valid @RequestBody CommentRequest request,
                                                 Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";

        CommentDTO comment = commentService.addComment(ticketId, request.resolveContent(), username);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentDTO> editComment(@PathVariable Long id,
                                                  @Valid @RequestBody CommentRequest request,
                                                  Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        CommentDTO comment = commentService.editComment(id, request.resolveContent(), username);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                              Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        commentService.deleteComment(id, username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteCommentByTicket(@PathVariable Long ticketId,
                                                      @PathVariable Long commentId,
                                                      Principal principal) {
        String username = principal != null ? principal.getName() : "demo-user";
        commentService.deleteComment(commentId, username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long ticketId) {
        List<CommentDTO> comments = commentService.getCommentsByTicket(ticketId);
        return ResponseEntity.ok(comments);
    }

    public static class CommentRequest {
        private String text;
        private String content;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String resolveContent() {
            return content != null ? content : text;
        }
    }
}
