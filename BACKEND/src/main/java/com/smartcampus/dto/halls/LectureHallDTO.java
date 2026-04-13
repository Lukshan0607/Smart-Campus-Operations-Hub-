package com.smartcampus.dto.halls;

import com.smartcampus.entity.halls.LectureHallStatus;
import lombok.Data;

@Data
public class LectureHallDTO {
    private Long id;
    private String name;
    private Integer capacity;
    private String location;
    private String facilities;
    private LectureHallStatus status;
}
