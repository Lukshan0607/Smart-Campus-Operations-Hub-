package com.smartcampus.controller.ticketing;

import com.smartcampus.dto.ticketing.CommentDTO;
import com.smartcampus.service.ticketing.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN')")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id,
                                                 @Valid @RequestBody CommentRequest request,
                                                 Principal principal) {
        CommentDTO created = commentService.addComment(id, request.getText(), principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/comments/{id}")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN')")
    public ResponseEntity<CommentDTO> editComment(@PathVariable Long id,
                                                  @Valid @RequestBody CommentRequest request,
                                                  Principal principal) {
        CommentDTO updated = commentService.editComment(id, request.getText(), principal.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, Principal principal) {
        commentService.deleteComment(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    public static class CommentRequest {
        private String text;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}
