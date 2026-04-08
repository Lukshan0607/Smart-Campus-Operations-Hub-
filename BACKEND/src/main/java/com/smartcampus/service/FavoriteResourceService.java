package com.smartcampus.service;

import java.util.List;

import com.smartcampus.dto.FavoriteResourceDTO;

public interface FavoriteResourceService {
    FavoriteResourceDTO addFavorite(Long userId, Long resourceId, String notes);
    void removeFavorite(Long userId, Long resourceId);
    List<FavoriteResourceDTO> listFavorites(Long userId);
    boolean isFavorite(Long userId, Long resourceId);
}

