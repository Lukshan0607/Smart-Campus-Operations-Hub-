package com.smartcampus.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, length = 50)
    private String reminderType;

    @Column(nullable = false)
    private LocalDateTime remindAt;

    @Column(nullable = false)
    @Default
    private Boolean sent = Boolean.FALSE;

    @Column(nullable = false, length = 30)
    @Default
    private String deliveryMethod = "IN_APP";
}