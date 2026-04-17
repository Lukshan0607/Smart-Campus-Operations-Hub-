package com.smartcampus.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteResourceDTO {
    private Long id;
    private Long userId;
    private Long resourceId;
    private LocalDateTime addedAt;
    private String notes;
}

