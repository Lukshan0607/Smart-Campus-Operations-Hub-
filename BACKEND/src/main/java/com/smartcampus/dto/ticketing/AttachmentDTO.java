package com.smartcampus.dto.ticketing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {

    private Long id;

    private Long ticketId;

    private String filename;

    private String fileUrl;

    private String contentType;

    private long fileSize;

    private Long uploadedById;

    private String uploadedByName;

    private LocalDateTime uploadedAt;
}
