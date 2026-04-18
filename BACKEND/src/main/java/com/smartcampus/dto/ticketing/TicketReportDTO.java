package com.smartcampus.dto.ticketing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketReportDTO {

    private String periodKey;

    private String periodLabel;

    private Long totalTickets;

    private Long openTickets;

    private Long inProgressTickets;

    private Long resolvedTickets;

    private Long closedTickets;

    private Long rejectedTickets;
}