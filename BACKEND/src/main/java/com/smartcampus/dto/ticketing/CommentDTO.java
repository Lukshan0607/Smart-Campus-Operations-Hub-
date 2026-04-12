package com.smartcampus.dto.ticketing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    private Long id;

    private Long ticketId;

    @NotBlank(message = "Comment text is required")
    @Size(min = 1, max = 1000, message = "Comment must be between 1 and 1000 characters")
    private String text;

    private Long authorId;

    private String authorName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean isAuthor;
}
