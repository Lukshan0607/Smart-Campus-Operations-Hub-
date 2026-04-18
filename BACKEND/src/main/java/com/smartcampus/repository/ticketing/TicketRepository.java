package com.smartcampus.repository.ticketing;

import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatorId(Long creatorId);

    List<Ticket> findByAssignedTechnicianId(Long technicianId);

    List<Ticket> findByStatus(TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.creatorId = :userId OR t.assignedTechnicianId = :userId OR :isAdmin = true")
    List<Ticket> findUserTickets(@Param("userId") Long userId, @Param("isAdmin") boolean isAdmin);

    @Query(value = """
            SELECT
                DATE_FORMAT(t.created_at, '%Y-%m') AS periodKey,
                DATE_FORMAT(t.created_at, '%b %Y') AS periodLabel,
                COUNT(*) AS totalTickets,
                SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS openTickets,
                SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressTickets,
                SUM(CASE WHEN t.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedTickets,
                SUM(CASE WHEN t.status = 'CLOSED' THEN 1 ELSE 0 END) AS closedTickets,
                SUM(CASE WHEN t.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedTickets
            FROM tickets t
            WHERE YEAR(t.created_at) = :year
            GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), DATE_FORMAT(t.created_at, '%b %Y')
            ORDER BY periodKey
            """, nativeQuery = true)
    List<TicketReportProjection> findMonthlyReport(@Param("year") int year);

    @Query(value = """
            SELECT
                CAST(YEAR(t.created_at) AS CHAR) AS periodKey,
                CAST(YEAR(t.created_at) AS CHAR) AS periodLabel,
                COUNT(*) AS totalTickets,
                SUM(CASE WHEN t.status = 'OPEN' THEN 1 ELSE 0 END) AS openTickets,
                SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressTickets,
                SUM(CASE WHEN t.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedTickets,
                SUM(CASE WHEN t.status = 'CLOSED' THEN 1 ELSE 0 END) AS closedTickets,
                SUM(CASE WHEN t.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedTickets
            FROM tickets t
            GROUP BY YEAR(t.created_at)
            ORDER BY YEAR(t.created_at)
            """, nativeQuery = true)
    List<TicketReportProjection> findYearlyReport();
}
