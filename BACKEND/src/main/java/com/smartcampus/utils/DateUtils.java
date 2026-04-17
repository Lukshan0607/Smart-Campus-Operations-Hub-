package com.smartcampus.utils;

import java.time.LocalDateTime;

public final class DateUtils {
    private DateUtils() {}

    public static boolean overlaps(LocalDateTime startA, LocalDateTime endA, LocalDateTime startB, LocalDateTime endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }
}

