package com.smartcampus.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.FavoriteResourceDTO;
import com.smartcampus.service.FavoriteResourceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FavoriteResourceController {

    private final FavoriteResourceService favoriteResourceService;

    @PostMapping
    public ResponseEntity<FavoriteResourceDTO> addFavorite(@RequestBody FavoriteResourceDTO request) {
        FavoriteResourceDTO dto = favoriteResourceService.addFavorite(
            request.getUserId(), 
            request.getResourceId(), 
            request.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFavorite(@RequestParam Long userId, @RequestParam Long resourceId) {
        favoriteResourceService.removeFavorite(userId, resourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FavoriteResourceDTO>> listFavorites(@PathVariable Long userId) {
        return ResponseEntity.ok(favoriteResourceService.listFavorites(userId));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> isFavorite(@RequestParam Long userId, @RequestParam Long resourceId) {
        boolean isFav = favoriteResourceService.isFavorite(userId, resourceId);
        return ResponseEntity.ok(Map.of("isFavorite", isFav));
    }
}
