package com.smartcampus.entity.halls;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lecture_halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LectureHall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    private String facilities;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LectureHallStatus status = LectureHallStatus.AVAILABLE;
}
