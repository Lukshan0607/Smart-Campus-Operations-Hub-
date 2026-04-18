package com.smartcampus.repository.ticketing;

public interface TicketReportProjection {

    String getPeriodKey();

    String getPeriodLabel();

    Long getTotalTickets();

    Long getOpenTickets();

    Long getInProgressTickets();

    Long getResolvedTickets();

    Long getClosedTickets();

    Long getRejectedTickets();
}